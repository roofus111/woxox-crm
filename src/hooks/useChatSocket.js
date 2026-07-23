'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

const SOCKET_EVENTS = [
  'new_message',
  'new_group_message',
  'message_sent',
  'message_delivered',
  'message_edited',
  'message_reaction',
  'message_reaction_removed',
  'message_read',
  'message_deleted',
  'user_typing',
  'user_status_change',
  'online_users',
  'group_created',
  'group_updated',
  'group_joined',
  'call_incoming',
  'call_answered',
  'call_ice_candidate',
  'call_rejected',
  'call_ended',
];

const toHandlerKey = (event) => {
  const camelKey = event.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return `on${camelKey.charAt(0).toUpperCase()}${camelKey.slice(1)}`;
};

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
        const fn = handlersRef.current[toHandlerKey(event)] || handlersRef.current[event];
        if (fn) fn(data);
      });
    });

    return () => {
      SOCKET_EVENTS.forEach((event) => socketInstance.off(event));
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  const getSocket = useCallback(() => socketRef.current, []);

  const sendMessage = useCallback((data) => {
    socketRef.current?.emit('private_message', data);
  }, []);

  const sendGroupMessage = useCallback((data) => {
    socketRef.current?.emit('group_message', data);
  }, []);

  const joinGroup = useCallback((groupId) => {
    if (!session?.user?.id) return;
    socketRef.current?.emit('join_group', { userId: session.user.id, groupId });
  }, [session?.user?.id]);

  const emitTyping = useCallback((to, isTyping, isGroup = false) => {
    if (!session?.user?.id) return;
    socketRef.current?.emit(isTyping ? 'typing_start' : 'typing_end', {
      userId: session.user.id,
      to,
      isGroup,
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

  const removeReaction = useCallback((messageId, userId) => {
    socketRef.current?.emit('remove_reaction', { messageId, userId });
  }, []);

  const callInvite = useCallback((payload) => {
    socketRef.current?.emit('call_invite', payload);
  }, []);

  const callAnswer = useCallback((payload) => {
    socketRef.current?.emit('call_answer', payload);
  }, []);

  const callIce = useCallback((payload) => {
    socketRef.current?.emit('call_ice_candidate', payload);
  }, []);

  const callReject = useCallback((payload) => {
    socketRef.current?.emit('call_reject', payload);
  }, []);

  const callEnd = useCallback((payload) => {
    socketRef.current?.emit('call_end', payload);
  }, []);

  return {
    socket: socketRef.current,
    getSocket,
    sendMessage,
    sendGroupMessage,
    joinGroup,
    emitTyping,
    markRead,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    callInvite,
    callAnswer,
    callIce,
    callReject,
    callEnd,
  };
}

export default useChatSocket;
