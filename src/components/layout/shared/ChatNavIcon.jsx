'use client';

import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import { useParams, useRouter } from 'next/navigation';
import { useUnreadChatCount } from '@/hooks/useUnreadChatCount';
import { getLocalizedUrl } from '@/utils/i18n';

const ChatNavIcon = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.lang || 'en';
  const unreadCount = useUnreadChatCount();

  const handleClick = () => {
    router.push(getLocalizedUrl('/apps/chat', locale));
  };

  return (
    <Tooltip title={unreadCount ? `Chat (${unreadCount} unread)` : 'Chat'}>
      <IconButton onClick={handleClick} className="text-textPrimary" aria-label="Open chat">
        <Badge
          badgeContent={unreadCount > 99 ? '99+' : unreadCount}
          color="error"
          invisible={!unreadCount}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className="ri-wechat-line" />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ChatNavIcon;
