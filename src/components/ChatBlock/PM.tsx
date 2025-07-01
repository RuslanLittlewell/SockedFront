import {
  Message,
  MessageType,
  privateChatUserState,
  privateMessagesState,
  Users,
} from "@/store";
import clsx from "clsx";
import { FC, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { Socket } from "socket.io-client";
import { MessageBlock } from "./MessageBlock";

interface Props {
  users: Users[];
  socket: Socket;
  username: string;
  allPivateMsg: { [key: string]: Message[] };
}
export const PM: FC<Props> = ({ users, socket, username, allPivateMsg }) => {
  const colorOrder: { [key: string]: number } = {
    "text-green-500": 1,
    "text-red-500": 2,
    "text-purple-500": 3,
    "text-pink-500": 4,
    "text-blue-500": 5,
  };

  const sortedUsers = [...users].sort((a, b) => {
    return (colorOrder[a.color] || 999) - (colorOrder[b.color] || 999);
  });

  const [filteredUsers, setFilteredUsers] = useState(sortedUsers);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useRecoilState(privateChatUserState);
  const [messages, setMessages] = useRecoilState(privateMessagesState);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    socket.emit("get-private-messages-history", { username: selectedUser });
  }, [selectedUser]);

  socket.on("send-private-message-history", (data) => {
    setMessages(data);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = (event: any) => {
    const query = event.target.value;
    const filtered = sortedUsers.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

 const findLastMessage = (userName: string) => {
  const userMessages = allPivateMsg[userName];
  
  if (!userMessages || userMessages.length === 0) {
    return '';
  }
  const lastMessage =  userMessages[userMessages.length - 1];
  if(lastMessage.isHost) {
    return `Me: ${lastMessage.text}`
  }
  return lastMessage.text;
};

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage,
        sender: username,
        isHost: true,
        type: MessageType.Message,
      };
      socket.emit("private-message", {
        username: selectedUser,
        message: messageData,
      });
      setNewMessage("");
    }
  };

  const handleBack = () => {
    setSelectedUser("");
    setMessages([]);
  };

  return (
    <div className="bg-white h-[calc(100%-25px)]">
      {selectedUser ? (
        <div className="h-[calc(100%-25px)]">
          <div
            onClick={handleBack}
            className="cursor-pointer text-blue-800 text-left px-4 py-2 border"
          >
            Back
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-0 h-[calc(100%-83px)]">
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
      ) : (
        <>
          <div className="p-1">
            <input
              type="search"
              className="bg-white border outline-none px-1 w-full"
              placeholder="Search user"
              onChange={handleSearch}
            />
          </div>
          <div className="relative overflow-auto bg-white h-[calc(100%-35px)]">
            {filteredUsers.map((user) => {
              const replaced = user.color.replace(/text-/g, "bg-");
              if (user.joined) {
                return (
                  <div
                    className={clsx(
                      "flex  cursor-pointer gap-2 text-left border p-2",
                      user.color
                    )}
                    onClick={() => setSelectedUser(user.name)}
                    key={user.id}
                  >
                    <div
                      className={clsx(
                        replaced,
                        "text-2xl uppercase flex items-center justify-center text-white w-[40px] h-[40px] rounded-full"
                      )}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                    <div className="font-black ">{user.name}</div>
                    <div className="font-thin text-black text-sm">{findLastMessage(user.name)}</div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}
    </div>
  );
};
