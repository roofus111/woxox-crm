'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

/**
 * Hook for WhatsApp real-time events via Socket.IO.
 * @param {object} handlers
 * @returns {{ socket: import('socket.io-client').Socket|null, emitTyping: Function }}
 */
export function useWhatsAppSocket(handlers = {}) {
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

    const events = [
      'whatsapp:new_message',
      'whatsapp:message_status',
      'whatsapp:new_lead',
      'whatsapp:conversation_assigned',
      'whatsapp:assignment_changed',
      'whatsapp:typing',
    ];

    events.forEach((event) => {
      socketInstance.on(event, (data) => {
        const handlerKey = event.replace('whatsapp:', 'on');
        const camelKey = handlerKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const fn = handlersRef.current[camelKey] || handlersRef.current[handlerKey];
        if (fn) fn(data);
      });
    });

    return () => {
      events.forEach((event) => socketInstance.off(event));
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit('whatsapp:join_conversation', { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit('whatsapp:leave_conversation', { conversationId });
  }, []);

  const emitTyping = useCallback((conversationId, isTyping) => {
    if (!session?.user?.id) return;
    socketRef.current?.emit(isTyping ? 'whatsapp:typing_start' : 'whatsapp:typing_end', {
      conversationId,
      userId: session.user.id,
    });
  }, [session?.user?.id]);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    emitTyping,
  };
}

export default useWhatsAppSocket;
