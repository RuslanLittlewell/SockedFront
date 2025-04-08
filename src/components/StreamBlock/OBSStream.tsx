import clsx from "clsx";
import { FC, forwardRef, Ref } from "react";

interface Props {
  isPrivateStrem: boolean;
  setPrivateStream: (e: boolean) => void;
}

export const OBSStream: FC<Props & { ref: Ref<HTMLVideoElement> }> = forwardRef(
  ({ isPrivateStrem, setPrivateStream }, ref) => {
    return (
      <div className="flex flex-col">
        <div
          className={clsx(
            "w-full h-[200px] pt-8 mb-[10px]",
            isPrivateStrem ? "bg-violet-500" : "bg-green-500"
          )}
        >
          Your steram currently <span className="font-bold">{isPrivateStrem ? 'private' : 'public'}</span>
        </div>
        <div className="bg-green-300 w-[80%] mx-auto p-3 border border-green-500">
          <p>Your stream is good</p>
          <p className="text-xs">Your bitrate is very good!</p>
        </div>
        <div className="mt-10 w-[80%] mx-auto">
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="w-full object-cover"
          />
        </div>
      </div>
    );
  }
);
