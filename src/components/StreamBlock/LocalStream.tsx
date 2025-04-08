import { FC, forwardRef, Ref } from "react";
import { ButtonBlock } from "./ButtonBlock";
import { FaExpand, FaCompress } from "react-icons/fa";

interface Props {
  handleStartBroadcasting: () => void;
  handleResolutionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleMicrophoneChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCameraChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  toggleFullscreen: () => void;
  setOBSStream: (e: boolean) => void;
  stopStream: () => void;
  selectedMicrophone: string;
  selectedCamera: string;
  isBroadcasting: boolean;
  microphones: MediaDeviceInfo[];
  isFullscreen: boolean;
  resolution: string;
  username: string;
  cameras: MediaDeviceInfo[];
}
export const LocalStream: FC<Props & { ref: Ref<HTMLVideoElement> }> =
  forwardRef(
    (
      {
        handleStartBroadcasting,
        handleResolutionChange,
        handleMicrophoneChange,
        handleCameraChange,
        toggleFullscreen,
        setOBSStream,
        stopStream,
        selectedMicrophone,
        selectedCamera,
        isBroadcasting,
        microphones,
        isFullscreen,
        resolution,
        username,
        cameras,
      },
      ref
    ) => {
      const resolutionOptions = [
        { label: "1920x1080", width: 1920, height: 1080 },
        { label: "1280x720", width: 1280, height: 720 },
        { label: "640x480", width: 640, height: 480 },
      ];

      return (
        <>
          <p className="text-black text-left">{username}'s room</p>
          <div className="bg-[#e0e0e0] text-lg text-black text-left pl-[10px] mt-5 h-8">
            Welcome back, {username}
          </div>
          <div className="grid grid-cols-[1fr_1fr] gap-[10px] mt-[10px]">
            <div className="border border-[#acacac] pb-[10px]">
              <p className="text-xl m-[10px] text-left">Camera</p>
              <select
                value={selectedCamera}
                onChange={handleCameraChange}
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
                ref={ref}
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
                onChange={handleMicrophoneChange}
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

            <ButtonBlock
              isBroadcasting={isBroadcasting}
              stopStream={stopStream}
              handleStartBroadcasting={handleStartBroadcasting}
              setOBSStream={setOBSStream}
            />
          </div>
        </>
      );
    }
  );
