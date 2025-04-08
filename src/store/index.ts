import { atom } from "recoil";

export interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: Date;
    tokens: number;
    donater?: string;
    isHost?: boolean;
    color: string;
  }

  export interface Users {
    name: string;
    color: string;
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
