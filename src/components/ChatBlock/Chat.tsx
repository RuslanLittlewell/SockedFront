import { messagesState, MessageType, tipMenuState } from "@/store";
import { useState, useEffect, useRef, FC } from "react";
import { useRecoilValue } from "recoil";
import { Socket } from "socket.io-client";
import { MessageBlock } from "./MessageBlock";

interface ChatProps {
  username: string;
  isHost?: boolean;
  socket: Socket;
}

export const Chat: FC<ChatProps> = ({ username, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const messages = useRecoilValue(messagesState);
  const tipMenu = useRecoilValue(tipMenuState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const noticeString = tipMenu
        .map((item) => `Notice: (${item.value}) ${item.description}`)
        .join("\n");

      const messageData = {
        text: noticeString,
        sender: username,
        type: MessageType.TipMenu,
        isHost: true,
      };

      socket?.emit("chat message", messageData);
    }
  }, [tipMenu, socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage,
        sender: username,
        type: MessageType.Message,
        isHost: true,
      };
      socket.emit("chat message", messageData);
      setNewMessage("");
    }
  };

  return (
    <div
      className={`bg-white text-black transition-all duration-300 h-[calc(100%-25px)]`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-0 h-[calc(100%-73px)]">
        {messages.map((message) => (
          <MessageBlock
            key={message.id}
            message={message}
            username={username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 space-y-2">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black-500"
          />
          <button
            type="submit"
            className="py-2 m-none bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
};
