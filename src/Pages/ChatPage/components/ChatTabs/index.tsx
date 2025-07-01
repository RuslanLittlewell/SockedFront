import { FC, useEffect, useState } from "react";
import { Chat, PM, UsersTab } from "@/components";
import clsx from "clsx";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  allPrivateMessagesState,
  chatActiveTabState,
  Message,
  messagesState,
  privateMessagesState,
  tokenState,
  Users,
  usersState,
} from "@/store";
import { io, Socket } from "socket.io-client";
import tokenOne from "@/assets/sounds/token-1-2.mp3";
import tokenSmall from "@/assets/sounds/token-3-24.mp3";
import tokenMedium from "@/assets/sounds/token-25-99.mp3";
import tokenHuge from "@/assets/sounds/token-100.mp3";

interface Props {
  roomId: string;
  username: string;
}

export const ChatTabs: FC<Props> = ({ roomId, username }) => {
  const [tab, setTab] = useRecoilState(chatActiveTabState);
  const setTokens = useSetRecoilState(tokenState);
  const setMessages = useSetRecoilState(messagesState);
  const setPrivateMessages = useSetRecoilState(privateMessagesState);
  const [users, setUsers] = useRecoilState(usersState);
  const [allPivateMsg, setAllPivateMsg] = useRecoilState(
    allPrivateMessagesState
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

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
    });

    newSocket.on("chat message", (message: Message) => {
      console.log("Получено новое сообщение:", message);
      setMessages((prev) => [...prev, message]);
      const tokens = message.tokens;
      if (tokens > 0) {
        let audio;

        if (tokens <= 2) {
          audio = tokenOne;
        } else if (tokens <= 24) {
          audio = tokenSmall;
        } else if (tokens <= 99) {
          audio = tokenMedium;
        } else {
          audio = tokenHuge;
        }

        new Audio(audio).play();

        setTokens((i: number) => i + message.tokens);
      }
    });

    newSocket.on("private-message", (message: Message) => {
      setPrivateMessages((prev) => [...prev, message]);
      newSocket.emit("get-all-private-messages");
    });

    newSocket.on("messages-deleted", () => {
      console.log("🗑️ Все сообщения были удалены сервером.");
      setMessages([]); // Очистка локального состояния сообщений на клиенте
      setTokens(0);
    });

    newSocket.on("usersData", (users: Users[]) => {
      setUsers(users);
    });

    newSocket.on("get-all-private-messages", (data) => {
      setAllPivateMsg(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, username]);

  const tabs = [
    <Chat username={username} socket={socket as Socket} />,
    <PM
      users={users}
      socket={socket as Socket}
      username={username}
      allPivateMsg={allPivateMsg}
    />,
    <UsersTab users={users} socket={socket as Socket} />,
  ];
  const userCount = users.filter((i) => i.joined).length;

  const tabName = ["CHAT", "PM", `USERS (${userCount})`];

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
