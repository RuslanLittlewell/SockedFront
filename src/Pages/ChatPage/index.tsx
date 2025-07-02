import { FC, useState } from "react";
import { StreamBlock } from "@/Pages/ChatPage/components/StreamBlock";
import Header from "./components/Header";
import { useFormik } from "formik";
import { ChatTabs } from "./components/ChatTabs";
import { LoginModal } from "@/components/LoginModal";
import { checkRoom } from "@/api/rooms";
import { toast } from "react-toastify";

export const ChatPage: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [room, setRoom] = useState("");

  const form = useFormik({
    initialValues: {
      username: "",
      roomId: "",
    },
    validate: (values) => {
      const errors: { username?: string; roomId?: string } = {};
      if (!values.username.trim()) {
        errors.username = "Введите имя пользователя";
      }
      if (!values.roomId.trim()) {
        errors.roomId = "Введите ID комнаты";
      }
      return errors;
    },
    onSubmit: (values) => {
      checkRoom(values.roomId).then((res) => {
        if (res.data.exists) {
          setRoom(values.roomId);
          setIsLoggedIn(true);
          toast.success(`Подключено к комнате: ${values.roomId}`);
        } else {
           toast.error("Комната не создана");
        }
      });
    },
  });

  const { username } = form.values;

  return (
    <div className="min-h-screen">
      {!isLoggedIn && (
        <LoginModal handleLogin={form.handleSubmit} form={form} />
      )}
      <Header username={username} />
      <div className="flex gap-[10px] bg-[#e0e0e0] border border-[#acacac] p-1 ml-[32px] mr-[17px] rounded-sm h-[614px] mt-10">
        <StreamBlock username={username} roomId={room} />
        <ChatTabs username={username} roomId={room} />
      </div>
    </div>
  );
};
