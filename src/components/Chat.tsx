import { Message, usersState } from "@/store";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { Socket } from "socket.io-client";

interface ChatProps {
  username: string;
  isHost?: boolean;
  messages: Message[];
  socket: Socket
}

export const Chat = ({ messages, username, socket }: ChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const users = useRecoilValue(usersState);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage,
        sender: username,
        isHost: true
      };
      console.log("Отправка сообщения:", messageData);
      socket.emit("chat message", messageData);
      setNewMessage("");
    }
  };

  return (
    <div
      className={`bg-white text-black transition-all duration-300 h-[calc(100%-35px)]`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-0 h-[calc(100%-73px)]">
        {messages.map((message) => {
          const findUser = users.find(i => i.name === message.donater);

          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === username ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`w-full text-left rounded-lg`}>
                {message.tokens > 0 ? (
                  <div className="text-xs mt-1 bg-yellow-300 text-black font-bold px-1 py-1">
                    <span className="text-red-500">{message.donater}</span> tipped{" "}
                    {message.tokens} token
                  </div>
                ) : message.isHost ? (<div className="text-sm bg-orange-500 px-2 rounded text-white">Me: {message.text}</div>) : (
                  <div className={clsx("text-sm")}>
                    <span className={clsx("text-black-500 font-bold mr-1", findUser?.color)}>
                      {message.donater}
                    </span>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
