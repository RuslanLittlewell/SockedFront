import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [resolution, setResolution] = useState("1920x1080");
  const resolutionOptions = [
    { label: "1920x1080", width: 1920, height: 1080 },
    { label: "1280x720", width: 1280, height: 720 },
    { label: "640x480", width: 640, height: 480 },
  ];

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
      ],
    });

    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", {
          candidate: event.candidate,
          peerId: "broadcaster",
          roomId,
        });
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Состояние соединения:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("Состояние ICE:", pc.iceConnectionState);
    };

    return pc;
  };

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
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((device) => device.kind === "videoinput"));
        setMicrophones(
          devices.filter((device) => device.kind === "audioinput")
        );

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
        console.error("Ошибка при получении списка устройств:", error);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    const getPreviewStream = async () => {
      try {
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
        }

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

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setStream(mediaStream);
        setLocalStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Ошибка при получении превью:", error);
      }
    };

    getPreviewStream();
  }, [selectedCamera, selectedMicrophone, resolution]);

  const startStream = async () => {
    if (!socket || !localStream) {
      console.error("Socket или локальный стрим не готовы");
      return;
    }
  
    try {
      const pc = createPeerConnection();
      setPeerConnections((prev) => ({ ...prev, broadcaster: pc }));
  
      // Добавляем все треки из локального потока в PeerConnection
      localStream.getTracks().forEach((track) => {
        console.log(`Добавление трека: ${track.kind}`);
        pc.addTrack(track, localStream);
      });
  
      // Создаём offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      console.log("Отправка offer на сервер");

      socket.emit("offer", {
        offer: pc.localDescription,
        peerId: "broadcaster",
        roomId,
      });

      console.log("Offer отправлен: ", pc.localDescription);
  
      setIsBroadcasting(true);

      // Прослушивание ответа от зрителя
      socket.on("answer", async ({ answer, peerId }) => {
        console.log("Получен answer от зрителя");
        const pc = peerConnections[peerId];
        if (pc && answer) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Удалённое описание установлено успешно");
        }
      });

      // Прослушивание входящих ICE кандидатов от зрителя
      socket.on("ice-candidate", async ({ candidate, peerId }) => {
        console.log("Получен ICE-кандидат от зрителя");
        const pc = peerConnections[peerId];
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE кандидат добавлен успешно");
        }
      });

    } catch (error) {
      console.error("Ошибка при запуске трансляции:", error);
    }
  };



  const handleStartBroadcasting = async () => {
    await startStream();
    setIsBroadcasting(true);
  };

  const stopStream = () => {
    if (peerConnections["broadcaster"]) {
      peerConnections["broadcaster"].close();
      const newPeerConnections = { ...peerConnections };
      delete newPeerConnections["broadcaster"];
      setPeerConnections(newPeerConnections);
    }
    setIsBroadcasting(false);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
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

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
  };

  const handleMicrophoneChange = (deviceId: string) => {
    setSelectedMicrophone(deviceId);
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResolution(e.target.value);
  };

  return (
    <div className="relative w-1/2 h-full border border-[#acacac] bg-white rounded-xs overflow-hidden p-[10px]">
      <p className="text-black text-left">{username}'s room</p>
      <div className="bg-[#e0e0e0] text-lg text-black text-left pl-[10px] mt-5 h-8">
        Welcome back, {username}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-[10px] mt-[10px]">
        <div className="border border-[#acacac] pb-[10px]">
          <p className="text-xl m-[10px] text-left">Camera</p>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="bg-white w-[calc(100%-20px)] text-black text-sm border border-[#acacac] mx-2 py-2 px-2"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Камера ${camera.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
          <p className="text-xl m-[10px] text-left">Resolution</p>
          <select
            value={resolution}
            onChange={handleResolutionChange}
            className="bg-white w-[calc(100%-20px)] text-black text-sm border border-[#acacac] mx-2 py-2 px-2"
          >
            {resolutionOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full object-cover"
          />
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            {isFullscreen ? (
              <FaCompress className="text-white text-xl" />
            ) : (
              <FaExpand className="text-white text-xl" />
            )}
          </button>
        </div>

        <div className="border border-[#acacac] pb-[10px]">
          <p className="text-xl m-[10px] text-left">Microphone</p>
          <select
            value={selectedMicrophone}
            onChange={(e) => handleMicrophoneChange(e.target.value)}
            className="bg-white text-black text-sm border border-[#acacac] mx-2 py-2 px-2"
          >
            {microphones.map((microphone) => (
              <option key={microphone.deviceId} value={microphone.deviceId}>
                {microphone.label ||
                  `Микрофон ${microphone.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>

          <button onClick={toggleMute} className="p-2">
            {isMuted ? (
              <FaMicrophoneSlash className="text-black text-xl" />
            ) : (
              <FaMicrophone className="text-black text-xl" />
            )}
          </button>
        </div>

        {isBroadcasting ? (
          <button
            onClick={stopStream}
            className="bg-red-500 border border-red-700 text-white h-[32px] flex items-center justify-center self-center rounded"
          >
            Stop Boardcasting
          </button>
        ) : (
          <button
            onClick={handleStartBroadcasting}
            className="bg-[#f47321] border border-[#cd5d26] text-white h-[32px] flex items-center justify-center self-center rounded"
          >
            Start Boardcasting
          </button>
        )}
      </div>
    </div>
  );
};
