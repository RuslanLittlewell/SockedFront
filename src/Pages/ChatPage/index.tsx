import { FC } from "react";
import { StreamBlock } from "@/Pages/ChatPage/components/StreamBlock";
import Header from "./components/Header";
import { ChatTabs } from "./components/ChatTabs";

interface Props {
  roomId: string;
  username: string;
}

export const ChatPage: FC<Props> = ({ roomId, username }) => {

  return (
    <div className="min-h-screen">
      <Header username={username} />
      <div className="flex gap-[10px] bg-[#e0e0e0] border border-[#acacac] p-1 ml-[32px] mr-[17px] rounded-sm h-[614px] mt-10">
        <StreamBlock username={username} roomId={roomId} />
        <ChatTabs roomId={roomId} username={username} />
      </div>
    </div>
  );
};
