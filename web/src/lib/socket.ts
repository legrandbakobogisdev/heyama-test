import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

// on garde une seule connexion partagée entre les pages
export function getSocket(): Socket {
  if (!socket) {
    // le handshake initial de socket.io est un GET (polling) ; meme header
    // que pour les appels REST, pour contourner l'avertissement ngrok.
    socket = io(API_URL, {
      extraHeaders: { "ngrok-skip-browser-warning": "true" },
    });
  }
  return socket;
}
