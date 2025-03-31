import { FC, useState } from "react";
import { Chat, PM, Users } from "@/components";
import clsx from "clsx";

interface Props {
  roomId: string;
  username: string;
}

export const ChatTabs: FC<Props> = ({ roomId, username }) => {
  const [tab, setTab] = useState(0);

  const tabs = [
    <Chat roomId={roomId} username={username} />,
    <PM />,
    <Users />,
  ];

  const tabName = ["CHAT", "PM", "USERS (1)"];

  return (
    <div className="w-1/2 border border-[#acacac]">
      <div className="bg-[#7f7f7f] flex gap-[5px] rounded-[2px_2px_0px_0px] px-[10px] pt-[5px]">
        {tabName.map((i, idx) => (
          <div
            className={clsx(
              "rounded-[4px_4px_0px_0px] p-1 py-0 text-sm font-bold cursor-pointer",
              idx === tab
                ? "bg-white text-[#dc5500]"
                : "bg-[#c9c9c9] text-[#4c4c4c]"
            )}
            key={idx}
            onClick={() => setTab(idx)}
          >
            {i}
          </div>
        ))}
      </div>
      {tabs[tab]}
    </div>
  );
};
