'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import {
  getActiveUserData,
  setProfileUser,
  setContacts,
  setGroups,
  setPreferences,
  upsertPreference,
  setConversations,
  setChatHistory,
  prependChatHistory,
  receiveMsg,
  confirmMsgSent,
  updateMsgStatus,
  editMsg,
  deleteMsg,
  addMsgReaction,
  removeMsgReaction,
  toggleMsgStar,
  updateContactStatus,
  setOnlineUsers,
  setTypingUser,
  mapUserToContact,
  sendMsg,
  markMsgFailed,
  addNewChat,
} from '@/redux-store/slices/chat'
import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'
import NewChatDialog from './NewChatDialog'
import NewGroupDialog from './NewGroupDialog'
import ForwardDialog from './ForwardDialog'
import CallOverlay, { useWebRTCCall } from './CallOverlay'
import { useSettings } from '@core/hooks/useSettings'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import chatApi, { ensureChatAuth } from '@/utils/chatApi'
import useChatSocket from '@/hooks/useChatSocket'
import { parseMentions } from './chatExtras'

const ChatWrapper = () => {
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [newGroupOpen, setNewGroupOpen] = useState(false)
  const [forwardMsg, setForwardMsg] = useState(null)
  const [replyToMsg, setReplyToMsg] = useState(null)
  const messageInputRef = useRef(null)
  const activeUserIdRef = useRef(null)
  const activeChatTypeRef = useRef('user')
  const typingTimeoutRef = useRef(null)
  const callHandlersRef = useRef({})

  const { settings } = useSettings()
  const dispatch = useDispatch()
  const chatStore = useSelector(state => state.chatReducer)
  const { data: session } = useSession()

  const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  const loadContacts = useCallback(async () => {
    if (!session?.user?.id) return []
    const currentUserId = session.user.id.toString()
    let rawContacts = []

    try {
      const contactsRes = await chatApi.getContacts()
      rawContacts = contactsRes.data?.data || []
    } catch {
      // fall through
    }

    if (!rawContacts.length) {
      try {
        const teamRes = await chatApi.getTeamMembers()
        rawContacts = (teamRes.data?.data || teamRes.data || []).filter(
          user => (user._id || user.id)?.toString() !== currentUserId
        )
      } catch {
        return []
      }
    }

    return rawContacts
      .filter(user => (user._id || user.id)?.toString() !== currentUserId)
      .map(mapUserToContact)
  }, [session?.user?.id])

  const loadInitialData = useCallback(async () => {
    if (!session?.user?.id) return
    ensureChatAuth(session.accessToken)
    try {
      dispatch(
        setProfileUser({
          id: session.user.id,
          fullName: session.user.name || 'Me',
          role: session.user.role || 'User',
          status: 'online',
        })
      )

      const [contacts, conversationsRes, groupsRes, prefsRes] = await Promise.all([
        loadContacts(),
        chatApi.getConversations().catch(() => ({ data: { data: { conversations: [] } } })),
        chatApi.listGroups().catch(() => ({ data: { data: [] } })),
        chatApi.getPreferences().catch(() => ({ data: { data: [] } })),
      ])

      dispatch(setContacts(contacts))
      dispatch(setConversations(conversationsRes.data?.data?.conversations || []))
      dispatch(setGroups(groupsRes.data?.data || []))
      dispatch(setPreferences(prefsRes.data?.data || []))

      try {
        const onlineRes = await chatApi.getOnlineUsers()
        dispatch(setOnlineUsers(onlineRes.data?.data?.userIds || []))
      } catch {
        // socket sync
      }
    } catch {
      toast.error('Failed to load chat data')
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.role, dispatch, loadContacts])

  const refreshContacts = useCallback(async () => {
    const contacts = await loadContacts()
    dispatch(setContacts(contacts))
    return contacts
  }, [loadContacts, dispatch])

  const loadChatHistory = useCallback(
    async (peerId, chatType = 'user') => {
      if (!peerId || !session?.user?.id) return
      try {
        const res =
          chatType === 'group'
            ? await chatApi.getGroupMessages(peerId, { limit: 40 })
            : await chatApi.getMessages(peerId, { limit: 40 })
        dispatch(
          setChatHistory({
            userId: peerId,
            messages: res.data?.data || [],
            chatType,
            hasMore: !!res.data?.pagination?.hasMore,
          })
        )
        if (chatType === 'user') await chatApi.markConversationRead(peerId)
      } catch {
        toast.error('Failed to load messages')
      }
    },
    [session?.user?.id, dispatch]
  )

  const {
    sendMessage,
    sendGroupMessage,
    joinGroup,
    emitTyping,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    callInvite,
    callAnswer,
    callIce,
    callReject,
    callEnd,
  } = useChatSocket({
    onNewMessage: data => {
      dispatch(receiveMsg(data))
      const fromId = (data.from?._id || data.from)?.toString()
      if (fromId && activeUserIdRef.current === fromId && activeChatTypeRef.current === 'user' && data.messageId) {
        chatApi.markAsRead(data.messageId).catch(() => {})
      }
    },
    onNewGroupMessage: data => {
      dispatch(receiveMsg(data))
    },
    onMessageSent: data => {
      if (data.success) {
        dispatch(
          confirmMsgSent({
            clientMessageId: data.clientMessageId,
            messageId: data.messageId,
            status: data.status,
          })
        )
      }
    },
    onMessageDelivered: data => {
      dispatch(
        updateMsgStatus({
          messageId: data.messageId,
          clientMessageId: data.clientMessageId,
          status: 'delivered',
        })
      )
    },
    onMessageRead: data => {
      dispatch(updateMsgStatus({ messageId: data.messageId, status: 'read' }))
    },
    onMessageEdited: data => {
      dispatch(editMsg({ messageId: data.messageId, newContent: data.newContent }))
    },
    onMessageDeleted: data => {
      dispatch(deleteMsg({ messageId: data.messageId }))
    },
    onMessageReaction: data => {
      dispatch(addMsgReaction({ messageId: data.messageId, userId: data.userId, emoji: data.emoji }))
    },
    onMessageReactionRemoved: data => {
      dispatch(removeMsgReaction({ messageId: data.messageId, userId: data.userId }))
    },
    onUserTyping: data => {
      if (data.userId?.toString() === activeUserIdRef.current) {
        dispatch(setTypingUser({ userId: data.userId, isTyping: data.isTyping }))
      }
    },
    onUserStatusChange: data => {
      dispatch(
        updateContactStatus({
          userId: data.userId?.toString(),
          status: data.status,
        })
      )
    },
    onOnlineUsers: data => {
      dispatch(setOnlineUsers(data.userIds || []))
    },
    onGroupCreated: async () => {
      try {
        const groupsRes = await chatApi.listGroups()
        dispatch(setGroups(groupsRes.data?.data || []))
      } catch {
        // ignore
      }
    },
    onCallIncoming: data => callHandlersRef.current.handleIncoming?.(data),
    onCallAnswered: data => callHandlersRef.current.handleAnswered?.(data),
    onCallIceCandidate: data => callHandlersRef.current.handleIce?.(data),
    onCallRejected: () => callHandlersRef.current.handleRejected?.(),
    onCallEnded: () => callHandlersRef.current.handleEnded?.(),
  })

  const { CallOverlayProps, startCall } = useWebRTCCall({
    selfId: session?.user?.id,
    callInvite,
    callAnswer,
    callIce,
    callReject,
    callEnd,
    onIncomingHandlers: handlers => {
      callHandlersRef.current = handlers
    },
  })

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    if (session?.accessToken) ensureChatAuth(session.accessToken)
  }, [session?.accessToken])

  const activeUser = useCallback(
    (id, chatType = 'user') => {
      dispatch(getActiveUserData({ id, chatType }))
      activeUserIdRef.current = id?.toString()
      activeChatTypeRef.current = chatType
      setReplyToMsg(null)
      loadChatHistory(id, chatType)
      if (chatType === 'group') joinGroup(id)
      if (messageInputRef.current) messageInputRef.current.focus()
    },
    [dispatch, loadChatHistory, joinGroup]
  )

  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) setBackdropOpen(false)
  }, [isBelowMdScreen, backdropOpen, sidebarOpen])

  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) setBackdropOpen(true)
  }, [isBelowSmScreen, sidebarOpen])

  useEffect(() => {
    if (!backdropOpen && sidebarOpen) setSidebarOpen(false)
  }, [backdropOpen, sidebarOpen])

  const handleSendMessage = async (text, file = null) => {
    if (!chatStore.activeUser || !session?.user?.id) return
    ensureChatAuth(session.accessToken)

    const to = chatStore.activeUser.id
    const isGroup = !!chatStore.activeUser.isGroup || chatStore.activeChatType === 'group'
    const clientMessageId = `temp_${Date.now()}`
    const mentions = parseMentions(text || '', chatStore.contacts)
    const replyPayload = replyToMsg
      ? {
          messageId: replyToMsg.messageId,
          message: replyToMsg.message,
          messageType: replyToMsg.messageType,
          fileName: replyToMsg.fileName,
        }
      : null

    try {
      if (file) {
        const uploadRes = await chatApi.uploadFile(file)
        const { fileUrl, fileName, fileSize, fileMimeType, messageType } = uploadRes.data.data

        dispatch(
          sendMsg({
            msg: fileName,
            messageType,
            fileUrl,
            fileName,
            clientMessageId,
            replyTo: replyPayload,
            peerId: to,
            chatType: isGroup ? 'group' : 'user',
          })
        )

        const res = isGroup
          ? await chatApi.sendGroupMessage(to, {
              content: fileName,
              messageType,
              fileUrl,
              fileName,
              fileSize,
              fileMimeType,
              clientMessageId,
              replyTo: replyToMsg?.messageId || undefined,
              mentions,
            })
          : await chatApi.sendMessage({
              to,
              content: fileName,
              messageType,
              fileUrl,
              fileName,
              fileSize,
              fileMimeType,
              clientMessageId,
              replyTo: replyToMsg?.messageId || undefined,
              mentions,
            })

        dispatch(
          confirmMsgSent({
            clientMessageId,
            messageId: res.data.data._id,
            status: res.data.data.status,
          })
        )
      } else if (text?.trim()) {
        dispatch(
          sendMsg({
            msg: text.trim(),
            clientMessageId,
            replyTo: replyPayload,
            mentions,
            peerId: to,
            chatType: isGroup ? 'group' : 'user',
          })
        )

        // Use REST (auth + durable) — controller also emits socket events to recipient
        const res = isGroup
          ? await chatApi.sendGroupMessage(to, {
              content: text.trim(),
              messageType: 'text',
              clientMessageId,
              replyTo: replyToMsg?.messageId || undefined,
              mentions,
            })
          : await chatApi.sendMessage({
              to,
              content: text.trim(),
              messageType: 'text',
              clientMessageId,
              replyTo: replyToMsg?.messageId || undefined,
              mentions,
            })

        dispatch(
          confirmMsgSent({
            clientMessageId,
            messageId: res.data?.data?._id,
            status: res.data?.data?.status || 'sent',
          })
        )
      }
      setReplyToMsg(null)
    } catch (err) {
      dispatch(markMsgFailed({ clientMessageId }))
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send message'
      toast.error(apiMsg)
    }

    emitTyping(to, false, isGroup)
  }

  const handleRetryMessage = async msg => {
    if (!msg?.failed) return
    await handleSendMessage(msg.message)
  }

  const handleTyping = isTyping => {
    if (!chatStore.activeUser) return
    const to = chatStore.activeUser.id
    const isGroup = !!chatStore.activeUser.isGroup
    emitTyping(to, isTyping, isGroup)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => emitTyping(to, false, isGroup), 2000)
    }
  }

  const handleEditMessage = (messageId, newContent) => {
    editMessage(messageId, session.user.id, newContent)
  }

  const handleDeleteMessage = messageId => {
    deleteMessage(messageId, session.user.id)
  }

  const handleAddReaction = (messageId, emoji) => {
    addReaction(messageId, session.user.id, emoji)
  }

  const handleRemoveReaction = messageId => {
    removeReaction(messageId, session.user.id)
  }

  const handleStarMessage = async msg => {
    try {
      const res = await chatApi.toggleStar(msg.messageId)
      dispatch(toggleMsgStar({ messageId: msg.messageId, starred: res.data?.data?.starred }))
    } catch {
      toast.error('Failed to star message')
    }
  }

  const handleForward = async payload => {
    try {
      await chatApi.forwardMessage(payload)
      toast.success('Message forwarded')
    } catch {
      toast.error('Forward failed')
    }
  }

  const handleLoadOlder = async () => {
    const peerId = chatStore.activeUser?.id
    const chatType = chatStore.activeChatType || 'user'
    if (!peerId) return
    const chat = chatStore.chats.find(
      c => c.userId?.toString() === peerId.toString() && (c.chatType || 'user') === chatType
    )
    const oldest = chat?.chat?.[0]?.time
    if (!oldest) return
    try {
      const res =
        chatType === 'group'
          ? await chatApi.getGroupMessages(peerId, { limit: 40, before: oldest })
          : await chatApi.getMessages(peerId, { limit: 40, before: oldest })
      dispatch(
        prependChatHistory({
          userId: peerId,
          messages: res.data?.data || [],
          chatType,
          hasMore: !!res.data?.pagination?.hasMore,
        })
      )
    } catch {
      toast.error('Failed to load older messages')
    }
  }

  const handleServerSearch = async q => {
    const peerId = chatStore.activeUser?.id
    const chatType = chatStore.activeChatType || 'user'
    if (!peerId) return []
    const res = await chatApi.searchMessages({
      q,
      withUserId: chatType === 'user' ? peerId : undefined,
      groupId: chatType === 'group' ? peerId : undefined,
    })
    return res.data?.data || []
  }

  const updatePref = async patch => {
    const peerId = chatStore.activeUser?.id
    if (!peerId) return
    const peerType = chatStore.activeUser?.isGroup ? 'group' : 'user'
    try {
      const res = await chatApi.updatePreference(peerId, { peerType, ...patch })
      dispatch(upsertPreference(res.data?.data || { peerId, peerType, ...patch }))
    } catch {
      toast.error('Failed to update preference')
    }
  }

  const handleCreateChat = useCallback(
    contact => {
      if (!contact?.id) return
      dispatch(addNewChat({ id: contact.id, chatType: contact.isGroup ? 'group' : 'user', isGroup: contact.isGroup }))
      activeUser(contact.id, contact.isGroup ? 'group' : 'user')
      if (isBelowMdScreen) {
        setSidebarOpen(false)
        setBackdropOpen(false)
      }
    },
    [dispatch, activeUser, isBelowMdScreen]
  )

  const handleCreateGroup = async payload => {
    const res = await chatApi.createGroup(payload)
    const group = res.data?.data
    if (group) {
      dispatch(setGroups([...(chatStore.groups || []), group]))
      handleCreateChat({ ...group, id: group._id, isGroup: true })
      toast.success('Group created')
    }
  }

  const prefKey = `${chatStore.activeUser?.isGroup ? 'group' : 'user'}:${chatStore.activeUser?.id}`
  const preference = chatStore.preferences?.[prefKey] || {}
  const existingChatUserIds = chatStore.chats.filter(c => (c.chatType || 'user') === 'user').map(c => c.userId?.toString())

  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered',
      })}
    >
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={id => {
          const contact = chatStore.contacts.find(c => c.id?.toString() === id?.toString())
          activeUser(id, contact?.isGroup ? 'group' : 'user')
        }}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        onOpenNewChat={() => setNewChatOpen(true)}
        onOpenNewGroup={() => setNewGroupOpen(true)}
      />

      <ChatContent
        chatStore={chatStore}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onAddReaction={handleAddReaction}
        onRemoveReaction={handleRemoveReaction}
        onReplyMessage={setReplyToMsg}
        onForwardMessage={setForwardMsg}
        onStarMessage={handleStarMessage}
        onRetryMessage={handleRetryMessage}
        onLoadOlder={handleLoadOlder}
        onServerSearch={handleServerSearch}
        replyToMsg={replyToMsg}
        onCancelReply={() => setReplyToMsg(null)}
        onOpenNewChat={() => setNewChatOpen(true)}
        onStartAudioCall={() =>
          startCall(chatStore.activeUser?.id, chatStore.activeUser?.fullName, 'audio')
        }
        onStartVideoCall={() =>
          startCall(chatStore.activeUser?.id, chatStore.activeUser?.fullName, 'video')
        }
        onToggleMute={() => updatePref({ muted: !preference.muted })}
        onTogglePin={() => updatePref({ pinned: !preference.pinned })}
        onToggleArchive={() => updatePref({ archived: !preference.archived })}
        onToggleBlock={() => updatePref({ blocked: !preference.blocked })}
        preference={preference}
      />

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        contacts={chatStore.contacts.filter(c => !c.isGroup)}
        existingChatUserIds={existingChatUserIds}
        onSelectContact={handleCreateChat}
        onRefreshContacts={refreshContacts}
      />

      <NewGroupDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        contacts={chatStore.contacts}
        onCreate={handleCreateGroup}
      />

      <ForwardDialog
        open={Boolean(forwardMsg)}
        onClose={() => setForwardMsg(null)}
        contacts={chatStore.contacts}
        groups={chatStore.groups}
        message={forwardMsg}
        onForward={handleForward}
      />

      <CallOverlay {...CallOverlayProps} />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}

export default ChatWrapper
