import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  tokens: number;
  donater?: string;
}

interface ChatProps {
  roomId: string;
  username: string;
  isHost?: boolean;
}

export const Chat = ({ roomId, username, isHost = false }: ChatProps) => {
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
        isHost,
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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, username, isHost]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage,
        sender: username,
        tokens: 0,
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-0 h-[calc(100%-73px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === username ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[80%] rounded-lg`}>
              {message.tokens > 0 ? (
                <div className="text-xs mt-1 bg-yellow-500 text-black font-bold">
                  <span className="text-red-500">{message.donater}</span> tipped{" "}
                  {message.tokens} token
                </div>
              ) : (
                <div className="text-sm">
                  {" "}
                  <span className="text-black-500">
                    {message.donater}
                  </span>: {message.text}
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
