import clsx from "clsx";
import { FC, forwardRef, Ref } from "react";
import { ButtonBlock } from "./ButtonBlock";

interface Props {
  isPrivateStrem: boolean;
  isBroadcasting: boolean;
  stopStream: () => void;
  handleStartBroadcasting: () => void;
}

export const OBSStream: FC<Props & { ref: Ref<HTMLVideoElement> }> = forwardRef(
  (
    { isPrivateStrem, isBroadcasting, stopStream, handleStartBroadcasting },
    ref
  ) => {
    return (
      <div className="flex flex-col">
        <div
          className={clsx(
            "w-full h-[200px] pt-8 mb-[10px]",
            isPrivateStrem ? "bg-violet-500" : "bg-green-500"
          )}
        >
          Your steram currently{" "}
          <span className="font-bold">
            {isPrivateStrem ? "private" : "public"}
          </span>
        </div>
        <div className="bg-green-300 w-[80%] mx-auto p-3 border border-green-500">
          <p>Your stream is good</p>
          <p className="text-xs">Your bitrate is very good!</p>
        </div>
        <div className="mt-6 w-[80%] mx-auto max-h-[210px]  flex justify-center">
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="h-[210px] object-cover"
          />
        </div>
        <ButtonBlock
          isBroadcasting={isBroadcasting}
          stopStream={stopStream}
          handleStartBroadcasting={handleStartBroadcasting}
        />
      </div>
    );
  }
);
