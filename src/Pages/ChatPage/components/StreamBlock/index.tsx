import { LocalStream } from "@/components/StreamBlock/LocalStream";
import { OBSStream } from "@/components/StreamBlock/OBSStream";
import { chatActiveTabState, MessageType, privateChatUserState } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SimplePeer from "simple-peer";
import { io, Socket } from "socket.io-client";

interface VideoStreamProps {
  username: string;
  roomId: string;
}

export const StreamBlock: React.FC<VideoStreamProps> = ({
  username,
  roomId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [resolution, setResolution] = useState<string>("1920x1080");

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOBSStream, setOBSStream] = useState(false);
  const [isPrivateStrem, setPrivateStream] = useState(false);
  const [privateRequest, setPrivateRequest] = useState(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [userPrivateRequest, setUserPrivateRuqeust] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const [selectedPrivateUser, setSelectedPrivateUser] = useRecoilState(privateChatUserState);
  const setChatTab = useSetRecoilState(chatActiveTabState)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const newSocket = io(apiUrl, {
      query: { roomId, username, role: "broadcaster" },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, username]);

  useEffect(() => {
    const getPreviewStream = async () => {
      try {
        // Остановка всех треков предыдущего потока, если он существует
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
        }

        // Разбор разрешения (например, "1280x720") в числовые значения
        const [width, height] = resolution.split("x").map(Number);
        const constraints = {
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 30 },
          },
          audio: {
            deviceId: selectedMicrophone
              ? { exact: selectedMicrophone }
              : undefined,
            echoCancellation: true,
            noiseSuppression: true,
          },
        };

        // Получение медиа-потока
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Установка полученного потока в элемент видео, если он существует
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Обновление состояний с потоком
        setStream(stream);
        setLocalStream(stream);

        // Получение списка всех устройств
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Фильтрация и установка устройств видеоввода и аудиоввода
        setCameras(devices.filter((device) => device.kind === "videoinput"));
        setMicrophones(
          devices.filter((device) => device.kind === "audioinput")
        );

        // Выбор дефолтных устройств, если установлены
        const defaultCamera = devices.find(
          (device) => device.kind === "videoinput"
        );
        const defaultMicrophone = devices.find(
          (device) => device.kind === "audioinput"
        );

        if (defaultCamera) setSelectedCamera(defaultCamera.deviceId);
        if (defaultMicrophone)
          setSelectedMicrophone(defaultMicrophone.deviceId);
      } catch (error) {
        console.error("Ошибка при получении превью:", error);
      }
    };

    getPreviewStream();
  }, [selectedCamera, selectedMicrophone, resolution, isOBSStream]);

  const startStream = async () => {
    if (!socket || !localStream) {
      console.error("Socket или локальный стрим не готовы");
      return;
    }
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream as MediaStream,
    });

    try {
      peer.on("signal", (data) => {
        console.log("📡 Sending offer to server", data);

        socket.emit("offer", { offer: data, roomId, username });
      });

      socket.on("answer", (data) => {
        console.log("📡 Получен answer от зрителя");
        peer.signal(data.answer);
      });

      socket.on("ice-candidate", (candidate) => {
        console.log("📡 Получен ICE-кандидат");
        if (candidate) peer.signal(candidate);
      });

      setIsBroadcasting(true);
    } catch (error) {
      console.error("Ошибка при запуске трансляции:", error);
    }
  };

  const handleStartBroadcasting = async () => {
    await startStream();
    setIsBroadcasting(true);
    setOBSStream(true)
  };

  const stopStream = () => {
    if (peerConnections["broadcaster"]) {
      peerConnections["broadcaster"].close();
      const newPeerConnections = { ...peerConnections };
      delete newPeerConnections["broadcaster"];
      setPeerConnections(newPeerConnections);
    }

    socket?.emit("broadcast-ended", { roomId, username });

    setIsBroadcasting(false);
    setOBSStream(false)
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
  };

  const handleMicrophoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMicrophone(e.target.value);
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResolution(e.target.value);
  };

  socket?.on("private-request", ({ username }) => {
    setUserPrivateRuqeust(username);
    setSelectedPrivateUser(username);
    setPrivateRequest(true);
  });


  const acceptPrivateStream = () => {
    setPrivateStream(true);
    setPrivateRequest(false);
    socket?.emit("user-accept-private", { roomId })
    setChatTab(1);
    const messageData = {
      text: 'Private show has begun.',
      donater: selectedPrivateUser,
      sender: "Admin",
      tokens: 0,
      type: MessageType.Announce
    };

    socket?.emit("private-message", {
      username: selectedPrivateUser,
      message: messageData,
    });
  };

  socket?.on("private-finished", () => {
    setPrivateStream(false);
  });

  return (
    <div className="relative w-2/5 h-full border border-[#acacac] bg-white rounded-xs overflow-hidden p-[10px]">
      {isOBSStream ? (
        <OBSStream
          isPrivateStrem={isPrivateStrem}
          ref={videoRef}
          isBroadcasting={isBroadcasting}
          stopStream={stopStream}
          handleStartBroadcasting={handleStartBroadcasting}
        />
      ) : (
        <LocalStream
          isBroadcasting={isBroadcasting}
          isFullscreen={isFullscreen}
          microphones={microphones}
          selectedCamera={selectedCamera}
          selectedMicrophone={selectedMicrophone}
          resolution={resolution}
          cameras={cameras}
          username={username}
          handleStartBroadcasting={handleStartBroadcasting}
          handleResolutionChange={handleResolutionChange}
          handleMicrophoneChange={handleMicrophoneChange}
          handleCameraChange={handleCameraChange}
          toggleFullscreen={toggleFullscreen}
          stopStream={stopStream}
          ref={videoRef}
        />
      )}

      {privateRequest && (
        <div className="absolute bottom-0 left-0  h-[100px] w-full bg-sky-100 pt-6">
          <p className="text-blue-600 font-bold">
            {userPrivateRequest} wants to start a private show. (
            <span className="font-black text-[#f47321] cursor-pointer" onClick={acceptPrivateStream}>
              Accept
            </span>{" "}
            or{" "}
            <span className="font-black text-[#f47321] cursor-pointer" onClick={() => setPrivateRequest(false)}>
              Decline
            </span>
            )
          </p>
          <p className="text-xs">This private show will earn you 6 tokens per minute, based on your settings.</p>
        </div>
      )}
    </div>
  );
};
