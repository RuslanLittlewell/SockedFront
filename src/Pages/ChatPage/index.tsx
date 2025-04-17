import { FC, useState } from "react";
import { StreamBlock } from "@/Pages/ChatPage/components/StreamBlock";
import Header from "./components/Header";
import { ChatTabs } from "./components/ChatTabs";
import { LoginModal } from "@/components/LoginModal";

export const ChatPage: FC = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const roomId = "test-room";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="min-h-screen">
      {!isLoggedIn && (
        <LoginModal
          handleLogin={handleLogin}
          username={username}
          setUsername={setUsername}
        />
      )}
      <Header username={username} />
      <div className="flex gap-[10px] bg-[#e0e0e0] border border-[#acacac] p-1 ml-[32px] mr-[17px] rounded-sm h-[614px] mt-10">
        <StreamBlock username={username} roomId={roomId} />
        <ChatTabs roomId={roomId} username={username} />
      </div>
    </div>
  );
};
