import { atom } from "recoil";

export enum MessageType {
  Message  = 'message',
  Token    = 'token',
  Announce = 'announce',
  Notify = 'notify',
}
export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  tokens: number;
  donater?: string;
  isHost?: boolean;
  color: string;
  type: MessageType;
}

export interface Users {
  id: number;
  name: string;
  color: string;
  joined: boolean;
  type: string;
}

export const tokenState = atom({
  key: "tokens",
  default: 0,
});

export const usersState = atom<Users[]>({
  key: "users",
  default: [],
});

export const messagesState = atom<Message[]>({
  key: "messages",
  default: [],
});

export const allPrivateMessagesState = atom<{[key: string]: Message[]}>({
  key: "allPrivateMessages",
  default: {},
});

export const privateMessagesState = atom<Message[]>({
  key: "privateMessages",
  default: [],
});

export const chatActiveTabState = atom<number>({
  key: "chatActiveTab",
  default: 0,
})

export const privateChatUserState = atom<string>({
  key: "privateChatUser",
  default: "",
})