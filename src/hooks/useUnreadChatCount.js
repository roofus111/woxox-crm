'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import chatApi from '@/utils/chatApi';
import useChatSocket from '@/hooks/useChatSocket';

export function useUnreadChatCount() {
  const [count, setCount] = useState(0);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userId = session?.user?.id?.toString();

  const fetchCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const res = await chatApi.getConversations({ limit: 100 });
      const conversations = res.data?.data?.conversations || [];
      const total = conversations.reduce(
        (sum, conv) => sum + (conv.conversationStats?.unreadCount || 0),
        0
      );
      setCount(total);
    } catch {
      // keep last known count on transient errors
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount, pathname]);

  useEffect(() => {
    const onFocus = () => fetchCount();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(fetchCount, 60000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchCount]);

  useChatSocket({
    onNewMessage: (data) => {
      const toId = (data.to?._id || data.to)?.toString();
      const fromId = (data.from?._id || data.from)?.toString();
      if (toId === userId && fromId !== userId) {
        setCount((prev) => prev + 1);
      }
    },
    onMessageRead: () => fetchCount(),
  });

  return count;
}

export default useUnreadChatCount;
