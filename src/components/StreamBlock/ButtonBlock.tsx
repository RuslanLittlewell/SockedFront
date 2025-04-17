import clsx from "clsx";
import { FC } from "react";

interface Props {
  isBroadcasting: boolean;
  handleStartBroadcasting: () => void;
  stopStream: () => void;
}
export const ButtonBlock: FC<Props> = ({
  isBroadcasting,
  handleStartBroadcasting,
  stopStream,
}) => {

  const buttonClass = " border border-red-700 text-white h-[32px] flex items-center justify-center self-center rounded w-full mt-3"
  return (
    <div>
        <button
          onClick={isBroadcasting ? stopStream : handleStartBroadcasting}
          className={clsx(buttonClass, isBroadcasting ? "bg-red-500" : "bg-[#f47321]")}
        >
          {isBroadcasting ? 'Stop Boardcasting' : 'Start Boardcasting'}
        </button>
      <div className="text-xs text-center mt-1">
        For high quality streams we strongly recommend:
        <p className="text-indigo-700 cursor-pointer">Use external software (OBS)</p>
      </div>
    </div>
  );
};
