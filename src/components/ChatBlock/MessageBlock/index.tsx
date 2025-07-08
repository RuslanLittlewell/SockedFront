import { Message, MessageType, tipMenuState, usersState } from "@/store";
import clsx from "clsx";
import { FC } from "react";
import { useRecoilValue } from "recoil";

interface Props {
  message: Message;
  username: string;
}
export const MessageBlock: FC<Props> = ({ message, username }) => {
  const users = useRecoilValue(usersState);
  const findUser = users.find((i) => i.name === message.donater);
  const tipMenu = useRecoilValue(tipMenuState);

  const findTipPoint = () => {
    if(message.type === MessageType.Token) {
      const findOptions = tipMenu.find((i) => i.value === message.tokens);
      const desc = findOptions?.description;
      return `(${desc})`
    }
    return ''
  };
  
  return (
    <div
      key={message.id}
      className={`flex ${
        message.sender === username ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`w-full text-left rounded-lg`}>
        {message.type === MessageType.Token && (
          <div className="text-xs mt-1 bg-yellow-300 text-black font-bold px-1 py-1">
            <span className={clsx(findUser?.color)}>{message.donater}</span> tipped{" "}
            {message.tokens} token {findTipPoint()}
          </div>
        )}
        {message.type === MessageType.Message && !message.isHost && (
          <div className={clsx("text-sm")}>
            <span
              className={clsx("text-black-500 font-bold mr-1", findUser?.color)}
            >
              {message.donater}
            </span>
            {message.text}
          </div>
        )}
        {message.type === MessageType.Message && message.isHost && (
          <div className="text-sm bg-orange-500 w-max px-2 rounded text-white">
            Me: {message.text}
          </div>
        )}
        {message.type === MessageType.Announce && (
          <div className="text-xs mt-1 bg-orange-300 text-black font-bold px-1 py-1">
            {message.text}
          </div>
        )}
        {message.type === MessageType.Notify && (
          <div className="text-xs mt-1 text-black font-bold px-1 py-1">
            {findUser?.type} <span className={clsx("text-black-500 font-bold", findUser?.color)}>{findUser?.name}</span> {message.text}.
          </div>
        )}
        {message.type === MessageType.TipMenu && (
          <pre className="text-sm text-orange-500 font-bold">
             {message.text}
          </pre>
        )}
      </div>
    </div>
  );
};
