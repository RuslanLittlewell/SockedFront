import { FC, useEffect, useState } from "react";
import { Chat, PM, UsersTab } from "@/components";
import clsx from "clsx";
import { useRecoilState, useRecoilValue } from "recoil";
import { Message, messagesState, tokenState, Users, usersState } from "@/store";
import { io, Socket } from "socket.io-client";

interface Props {
  roomId: string;
  username: string;
}

export const ChatTabs: FC<Props> = ({ roomId, username }) => {
  const [tab, setTab] = useState(0);
  const users = useRecoilValue(usersState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [_, setTokens] = useRecoilState(tokenState);
  const [__, setUsers] = useRecoilState(usersState);
  const [messages, setMessages] = useRecoilState(messagesState);

  const apiUrl = import.meta.env.VITE_API_URL;

  const classes = [
    "text-green-500",
    "text-red-500",
    "text-purple-500",
    "text-pink-500",
    "text-blue-500",
  ];

  function getRandomClass() {
    return classes[Math.floor(Math.random() * classes.length)];
  }

  useEffect(() => {
    const newSocket = io(apiUrl, {
      query: {
        roomId,
        username,
      },
    });

    newSocket.on("connect", () => {
      console.log("Подключено к серверу");
    });

    newSocket.on("messageHistory", (history: Message[]) => {
      console.log("Получена история сообщений:", history);
      setMessages(history);
      history.forEach((message) => {
        const UserNickname = message.donater;
        setUsers((prevUsers: any) => {
          const userExists = (prevUsers as Users[]).some(
            (user: Users) => user.name === UserNickname
          );
  
          if (!userExists) {
            return [
              ...prevUsers,
              { name: UserNickname, color: getRandomClass() },
            ];
          }
  
          return prevUsers;
        });
      })
    });

    newSocket.on("chat message", (message: Message) => {
      console.log("Получено новое сообщение:", message);
      setMessages((prev) => [...prev, message]);
      if (message.tokens > 0) {
        setTokens((i: number) => i + message.tokens);
      }
      const UserNickname = message.donater;
      setUsers((prevUsers: any) => {
        const userExists = (prevUsers as Users[]).some(
          (user: Users) => user.name === UserNickname
        );

        if (!userExists) {
          return [
            ...prevUsers,
            { name: UserNickname, color: getRandomClass() },
          ];
        }

        return prevUsers;
      });
    });

    newSocket.on("messages-deleted", () => {
      console.log("🗑️ Все сообщения были удалены сервером.");
      setMessages([]); // Очистка локального состояния сообщений на клиенте
      setTokens(0);
      setUsers([]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, username]);

  const tabs = [
    <Chat username={username} messages={messages} socket={socket as Socket} />,
    <PM />,
    <UsersTab users={users} />,
  ];

  const tabName = ["CHAT", "PM", `USERS (${users.length})`];

  return (
    <div className="w-3/5 border border-[#acacac]">
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
