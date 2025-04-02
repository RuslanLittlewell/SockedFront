import React, { useEffect, useRef, useState } from "react";
import {
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import SimplePeer from "simple-peer"
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

        await navigator.mediaDevices.getUserMedia(
          constraints
        ).then(stream => {

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          setStream(stream);
          setLocalStream(stream);
        })


       
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
    const peer = new SimplePeer({
			initiator: true,
			trickle: false,
			stream: stream as MediaStream
		})

    try {

      peer.on("signal", (data) => {
        console.log("📡 Sending offer to server", data);
    
        socket.emit("offer", { offer: data, roomId, username });
      });

      socket.on("answer", (data) => {
        console.log("📡 Получен answer от зрителя");
        peer.signal(data.answer); // Важно: передаём answer обратно в SimplePeer
      });
    
      socket.on("ice-candidate", (candidate) => {
        console.log("📡 Получен ICE-кандидат");
        if (candidate) peer.signal(candidate);
      });

      peer.on("stream", (stream) => {
        
        if(videoRef.current) {
				  videoRef.current.srcObject = stream
        }
			
		})
  
      setIsBroadcasting(true);

    } catch (error) {
      console.error("Ошибка при запуске трансляции:", error);
    }
  };



  const handleStartBroadcasting = async () => {
    await startStream();
    setIsBroadcasting(true);
  };

  const stopStream = () => {
    // Остановить все медиатрекеры (аудио и видео)
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null); // Сброс локального потока
    }
  
    // Закрытие PeerJS соединений
    if (peerConnections["broadcaster"]) {
      peerConnections["broadcaster"].close(); // Используй destroy() вместо close() для полного отключения
      const newPeerConnections = { ...peerConnections };
      delete newPeerConnections["broadcaster"];
      setPeerConnections(newPeerConnections);
    }
  
    // Отправить зрителям сообщение о завершении трансляции
    socket?.emit("broadcast-ended", { roomId, username });
  
    // Сброс состояния
    setIsBroadcasting(false);
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
    <div className="relative w-2/5 h-full border border-[#acacac] bg-white rounded-xs overflow-hidden p-[10px]">
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
            className="bg-white text-black text-sm  w-[calc(100%-20px)] border border-[#acacac] mx-2 py-2 px-2"
          >
            {microphones.map((microphone) => (
              <option key={microphone.deviceId} value={microphone.deviceId}>
                {microphone.label ||
                  `Микрофон ${microphone.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
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
