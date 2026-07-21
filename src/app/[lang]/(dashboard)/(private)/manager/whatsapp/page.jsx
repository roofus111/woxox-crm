'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, IconButton, Avatar, Badge, Chip,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider,
  InputAdornment, CircularProgress, Paper, Tabs, Tab, Drawer,
  useMediaQuery, useTheme, Skeleton,
} from '@mui/material';
import { toast } from 'react-toastify';
import whatsappApi from '@/utils/whatsappApi';
import useWhatsAppSocket from '@/hooks/useWhatsAppSocket';
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('@emoji-mart/react').then((mod) => mod.default), { ssr: false });

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'New' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message }) {
  const isOutbound = message.direction === 'outbound';
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOutbound ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          maxWidth: '70%',
          bgcolor: isOutbound ? '#DCF8C6' : '#FFFFFF',
          borderRadius: 2,
          borderTopRightRadius: isOutbound ? 0 : 2,
          borderTopLeftRadius: isOutbound ? 2 : 0,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content || `[${message.type}]`}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatTime(message.createdAt)}
          </Typography>
          {isOutbound && (
            <i
              className={`ri-check-${message.status === 'read' ? 'double' : 'line'}-line`}
              style={{ fontSize: 14, color: message.status === 'read' ? '#34B7F1' : '#999' }}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

function ContactSidebar({ profile, open, onClose }) {
  if (!profile) return null;
  const { conversation, timeline } = profile;
  const lead = conversation?.lead;
  const contact = conversation?.contact;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 320 } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 1, bgcolor: '#25D366' }}>
            {(contact?.name || contact?.phone || '?')[0]}
          </Avatar>
          <Typography variant="h6">{contact?.name || 'Unknown'}</Typography>
          <Typography color="text.secondary">{contact?.phone}</Typography>
          {lead && <Chip label={lead.status} size="small" sx={{ mt: 1 }} />}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {lead && (
          <>
            <Typography variant="subtitle2" gutterBottom>Lead Info</Typography>
            <Typography variant="body2" color="text.secondary">Email: {lead.email || 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary">Status: {lead.status}</Typography>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Typography variant="subtitle2" gutterBottom>Recent Activity</Typography>
        {(timeline || []).slice(0, 5).map((item) => (
          <Typography key={item._id} variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
            {item.action}: {item.details?.slice(0, 50)}
          </Typography>
        ))}
      </Box>
    </Drawer>
  );
}

export default function WhatsAppInboxPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const selectedConversation = conversations.find((c) => c._id === selectedId);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await whatsappApi.getConversations({ filter, search: search || undefined });
      setConversations(res.data?.data || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [filter, search]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoadingMessages(true);
      const res = await whatsappApi.getMessages(conversationId, { limit: 100 });
      setMessages(res.data?.data || []);
      await whatsappApi.markRead(conversationId);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const { joinConversation, leaveConversation, emitTyping } = useWhatsAppSocket({
    onNewMessage: (data) => {
      if (data.conversationId === selectedId) {
        setMessages((prev) => [...prev, data.message]);
      }
      fetchConversations();
    },
    onMessageStatus: (data) => {
      if (data.conversationId === selectedId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === data.messageId ? { ...m, status: data.status } : m))
        );
      }
    },
    onTyping: (data) => {
      if (data.conversationId === selectedId) setTypingUser(data.isTyping ? data.userId : null);
    },
    onNewLead: () => fetchConversations(),
    onAssignmentChanged: () => fetchConversations(),
  });

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      joinConversation(selectedId);
      return () => leaveConversation(selectedId);
    }
  }, [selectedId, fetchMessages, joinConversation, leaveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedId) return;
    try {
      setSending(true);
      const res = await whatsappApi.sendMessage(selectedId, { type: 'text', content: messageText });
      setMessages((prev) => [...prev, res.data.data]);
      setMessageText('');
      emitTyping(selectedId, false);
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openProfile = async () => {
    if (!selectedId) return;
    try {
      const res = await whatsappApi.getContactProfile(selectedId);
      setProfile(res.data.data);
      setProfileOpen(true);
    } catch {
      toast.error('Failed to load profile');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', bgcolor: '#F0F2F5', borderRadius: 2, overflow: 'hidden' }}>
      {/* Conversation List */}
      <Box
        sx={{
          width: isMobile && selectedId ? 0 : { xs: '100%', md: 360 },
          display: isMobile && selectedId ? 'none' : 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E9EDEF',
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#F0F2F5' }}>
          <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-whatsapp-line" style={{ color: '#25D366' }} />
            WhatsApp Inbox
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 36, borderBottom: '1px solid #E9EDEF' }}
        >
          {FILTER_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} sx={{ minHeight: 36, py: 0.5, fontSize: 12 }} />
          ))}
        </Tabs>
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {loadingConversations ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ListItemButton key={i} sx={{ py: 1.5 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box flex={1}>
                  <Skeleton width="60%" />
                  <Skeleton width="80%" />
                </Box>
              </ListItemButton>
            ))
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <i className="ri-chat-3-line" style={{ fontSize: 48, color: '#ccc' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No conversations yet</Typography>
            </Box>
          ) : (
            conversations.map((conv) => (
              <ListItemButton
                key={conv._id}
                selected={selectedId === conv._id}
                onClick={() => setSelectedId(conv._id)}
                sx={{ py: 1.5, borderBottom: '1px solid #F0F2F5' }}
              >
                <ListItemAvatar>
                  <Badge badgeContent={conv.unreadCount || 0} color="success">
                    <Avatar sx={{ bgcolor: '#25D366' }}>
                      {(conv.contact?.name || conv.contact?.phone || '?')[0]}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" noWrap>{conv.contact?.name || conv.contact?.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatTime(conv.lastMessageAt)}</Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {conv.lastMessageDirection === 'outbound' && '✓ '}{conv.lastMessage}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#E5DDD5' }}>
        {!selectedId ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <i className="ri-whatsapp-line" style={{ fontSize: 80, color: '#25D366', opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>Select a conversation to start chatting</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 1.5, bgcolor: '#F0F2F5', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #E9EDEF' }}>
              {isMobile && (
                <IconButton onClick={() => setSelectedId(null)} size="small">
                  <i className="ri-arrow-left-line" />
                </IconButton>
              )}
              <Avatar sx={{ bgcolor: '#25D366', width: 40, height: 40 }}>
                {(selectedConversation?.contact?.name || '?')[0]}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1">{selectedConversation?.contact?.name || selectedConversation?.contact?.phone}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {typingUser ? 'typing...' : selectedConversation?.contact?.phone}
                </Typography>
              </Box>
              <IconButton onClick={openProfile}><i className="ri-user-line" /></IconButton>
              <IconButton><i className="ri-search-line" /></IconButton>
              <IconButton><i className="ri-more-2-fill" /></IconButton>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
              {loadingMessages ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} /></Box>
              ) : (
                messages.map((msg) => <MessageBubble key={msg._id} message={msg} />)
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#F0F2F5', display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => setShowEmoji(!showEmoji)}><i className="ri-emotion-line" /></IconButton>
              <IconButton><i className="ri-attachment-2" /></IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder="Type a message"
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  emitTyping(selectedId, true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }}
              />
              <IconButton
                onClick={handleSend}
                disabled={sending || !messageText.trim()}
                sx={{ bgcolor: '#25D366', color: '#fff', '&:hover': { bgcolor: '#128C7E' }, '&.Mui-disabled': { bgcolor: '#ccc' } }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <i className="ri-send-plane-fill" />}
              </IconButton>
            </Box>
            {showEmoji && (
              <Box sx={{ position: 'absolute', bottom: 80, left: 20, zIndex: 10 }}>
                <Picker data={async () => (await import('@emoji-mart/data')).default} onEmojiSelect={(emoji) => setMessageText((t) => t + emoji.native)} theme="light" />
              </Box>
            )}
          </>
        )}
      </Box>

      <ContactSidebar profile={profile} open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
