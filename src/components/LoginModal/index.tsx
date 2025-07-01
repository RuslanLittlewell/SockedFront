import { FormikProps } from "formik";
import { FC } from "react";

interface FormValues {
  username: string;
  roomId: string;
}

interface Props {
  handleLogin: (e?: React.FormEvent<HTMLFormElement>) => void;
  form: FormikProps<FormValues>;
}
export const LoginModal: FC<Props> = ({
  handleLogin,
  form
}) => {
  return (
    <div className="fixed min-h-screen z-50 flex w-full items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <form
        onSubmit={handleLogin}
        className="relative bg-black/80 py-6 px-12 max-w-[500px] rounded-lg shadow-lg border border-purple-500/50"
      >
        <input
          type="text"
          name="username"
          value={form.values.username}
          onChange={form.handleChange}
          className="w-full px-4 py-2 bg-gray-800/50 text-white border border-purple-500/50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ваше имя"
        />
        <input
          type="text"
          name="roomId"
          value={form.values.roomId}
          onChange={form.handleChange}
          className="w-full px-4 py-2 bg-gray-800/50 text-white border border-purple-500/50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="ID комнаты"
        />
        <button
          type="submit"
          className="w-full bg-[#0c6a93] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Войти
        </button>
      </form>
    </div>
  );
};
