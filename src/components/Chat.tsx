import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  tokens: number;
  donater?: string;
  isHost?: boolean;
}

interface ChatProps {
  roomId: string;
  username: string;
  isHost?: boolean;
  setTokens: React.Dispatch<React.SetStateAction<number>>
  setUsers: React.Dispatch<React.SetStateAction<(string | undefined)[]>>
}

export const Chat = ({ roomId, username, setTokens, setUsers }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const lastMessage = messages[messages.length - 1];

    if(lastMessage) {
      if(lastMessage.tokens > 0) {
        setTokens((i: number) => i + lastMessage.tokens)
      }
      const UserNickname = lastMessage.donater;
      setUsers((prevUsers) => {
        const userExists = (prevUsers as string[]).some((user: string) => user === UserNickname);
  
        if (!userExists) {
          return [...prevUsers, UserNickname];
        }
  
        return prevUsers; 
      });
    }


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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === username ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[80%] rounded-lg`}>
              {message.tokens > 0 ? (
                <div className="text-xs mt-1 bg-yellow-500 text-black font-bold px-1">
                  <span className="text-red-500">{message.donater}</span> tipped{" "}
                  {message.tokens} token
                </div>
              ) : message.isHost ? (<div className="text-sm bg-orange-500 px-2 rounded text-white">Me: {message.text}</div>) : (
                <div className="text-sm">
                  <span className="text-black-500 font-bold">
                    {message.donater}
                  </span>
                  : {message.text}
                </div>
              )}
            </div>
          </div>
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
