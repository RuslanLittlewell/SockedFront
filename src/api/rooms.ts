import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


export const checkRoom = (roomId: string) => {
  return axios.get(`${API_URL}/rooms/${roomId}/exists`);
};

export const fetchTipMenu = (roomId: string) => {
  return axios.get(`${API_URL}/tip-menu/${roomId}`);
};