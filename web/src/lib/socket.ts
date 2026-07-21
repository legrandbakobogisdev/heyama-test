import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

// on garde une seule connexion partagée entre les pages
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL);
  }
  return socket;
}
