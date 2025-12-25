// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = (serverUrl) => {
  if (!socket) {
    socket = io(serverUrl, {
      withCredentials: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
