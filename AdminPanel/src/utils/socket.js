import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000","https://dineflow-adminpanel.vercel.app",
      "https://dineflow-customer.vercel.app", {
  withCredentials: true,
  transports: ["websocket"], // optional but avoids fallback issues
});
