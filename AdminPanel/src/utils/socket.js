import { io } from "socket.io-client";

export const socket = io("http://192.168.236.119:5000", {
  withCredentials: true,
  transports: ["websocket"], // optional but avoids fallback issues
});
