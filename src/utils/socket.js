// utils/socket.js
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
            autoConnect: false,
            transports: ['websocket'], // faster, no long-polling fallback
            reconnectionAttempts: 5
        });
    }
    return socket;
};
