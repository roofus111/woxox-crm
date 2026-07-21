'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

const SOCKET_EVENTS = [
  'new_message',
  'message_sent',
  'message_edited',
  'message_reaction',
  'message_read',
  'message_deleted',
  'user_typing',
  'user_status_change',
  'online_users',
];

export function useChatSocket(handlers = {}) {
  const { data: session } = useSession();
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 10,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      if (session?.user?.id) {
        socketInstance.emit('register', session.user.id);
      }
    });

    SOCKET_EVENTS.forEach((event) => {
      socketInstance.on(event, (data) => {
        const camelKey = event.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const fn = handlersRef.current[`on${camelKey.charAt(0).toUpperCase()}${camelKey.slice(1)}`]
          || handlersRef.current[camelKey];
        if (fn) fn(data);
      });
    });

    return () => {
      SOCKET_EVENTS.forEach((event) => socketInstance.off(event));
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  const sendMessage = useCallback((data) => {
    socketRef.current?.emit('private_message', data);
  }, []);

  const emitTyping = useCallback((to, isTyping) => {
    if (!session?.user?.id) return;
    socketRef.current?.emit(isTyping ? 'typing_start' : 'typing_end', {
      userId: session.user.id,
      to,
    });
  }, [session?.user?.id]);

  const markRead = useCallback((messageId, userId) => {
    socketRef.current?.emit('mark_read', { messageId, userId });
  }, []);

  const editMessage = useCallback((messageId, userId, newContent) => {
    socketRef.current?.emit('edit_message', { messageId, userId, newContent });
  }, []);

  const deleteMessage = useCallback((messageId, userId) => {
    socketRef.current?.emit('delete_message', { messageId, userId });
  }, []);

  const addReaction = useCallback((messageId, userId, emoji) => {
    socketRef.current?.emit('add_reaction', { messageId, userId, emoji });
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    emitTyping,
    markRead,
    editMessage,
    deleteMessage,
    addReaction,
  };
}

export default useChatSocket;
