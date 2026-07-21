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
  setConversations,
  setChatHistory,
  receiveMsg,
  confirmMsgSent,
  updateMsgStatus,
  editMsg,
  deleteMsg,
  addMsgReaction,
  updateContactStatus,
  setOnlineUsers,
  setTypingUser,
  mapUserToContact,
  sendMsg,
  addNewChat,
} from '@/redux-store/slices/chat'
import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'
import NewChatDialog from './NewChatDialog'
import { useSettings } from '@core/hooks/useSettings'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import chatApi from '@/utils/chatApi'
import useChatSocket from '@/hooks/useChatSocket'

const ChatWrapper = () => {
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const messageInputRef = useRef(null)
  const activeUserIdRef = useRef(null)
  const typingTimeoutRef = useRef(null)

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
      // fall through to team members endpoint
    }

    if (!rawContacts.length) {
      try {
        const teamRes = await chatApi.getTeamMembers()
        rawContacts = (teamRes.data?.data || teamRes.data || [])
          .filter(user => (user._id || user.id)?.toString() !== currentUserId)
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
    try {
      dispatch(setProfileUser({
        id: session.user.id,
        fullName: session.user.name || 'Me',
        role: session.user.role || 'User',
        status: 'online',
      }))

      const [contacts, conversationsRes] = await Promise.all([
        loadContacts(),
        chatApi.getConversations().catch(() => ({ data: { data: { conversations: [] } } })),
      ])

      dispatch(setContacts(contacts))
      dispatch(setConversations(conversationsRes.data?.data?.conversations || []))

      try {
        const onlineRes = await chatApi.getOnlineUsers()
        dispatch(setOnlineUsers(onlineRes.data?.data?.userIds || []))
      } catch {
        // socket will sync online users after connect
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

  const loadChatHistory = useCallback(async (userId) => {
    if (!userId || !session?.user?.id) return
    try {
      const res = await chatApi.getMessages(userId, { limit: 100 })
      dispatch(setChatHistory({ userId, messages: res.data?.data || [] }))
      await chatApi.markConversationRead(userId)
    } catch {
      toast.error('Failed to load messages')
    }
  }, [session?.user?.id, dispatch])

  const { sendMessage, emitTyping, editMessage, deleteMessage, addReaction } = useChatSocket({
    onNewMessage: (data) => {
      dispatch(receiveMsg(data))
      const fromId = (data.from?._id || data.from)?.toString()
      if (fromId && activeUserIdRef.current === fromId && data.messageId) {
        chatApi.markAsRead(data.messageId).catch(() => {})
      }
    },
    onMessageSent: (data) => {
      if (data.success) {
        dispatch(confirmMsgSent({
          clientMessageId: data.clientMessageId,
          messageId: data.messageId,
          status: data.status,
        }))
      }
    },
    onMessageRead: (data) => {
      dispatch(updateMsgStatus({ messageId: data.messageId, status: 'read' }))
    },
    onMessageEdited: (data) => {
      dispatch(editMsg({ messageId: data.messageId, newContent: data.newContent }))
    },
    onMessageDeleted: (data) => {
      dispatch(deleteMsg({ messageId: data.messageId }))
    },
    onMessageReaction: (data) => {
      dispatch(addMsgReaction({ messageId: data.messageId, userId: data.userId, emoji: data.emoji }))
    },
    onUserTyping: (data) => {
      if (data.userId?.toString() === activeUserIdRef.current) {
        dispatch(setTypingUser({ userId: data.userId, isTyping: data.isTyping }))
      }
    },
    onUserStatusChange: (data) => {
      dispatch(updateContactStatus({
        userId: data.userId?.toString(),
        status: data.status,
      }))
    },
    onOnlineUsers: (data) => {
      dispatch(setOnlineUsers(data.userIds || []))
    },
  })

  useEffect(() => { loadInitialData() }, [loadInitialData])

  const activeUser = useCallback((id) => {
    dispatch(getActiveUserData(id))
    activeUserIdRef.current = id?.toString()
    loadChatHistory(id)
    if (messageInputRef.current) messageInputRef.current.focus()
  }, [dispatch, loadChatHistory])

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
    const to = chatStore.activeUser.id
    const clientMessageId = `temp_${Date.now()}`

    try {
      if (file) {
        const uploadRes = await chatApi.uploadFile(file)
        const { fileUrl, fileName, fileSize, fileMimeType, messageType } = uploadRes.data.data

        dispatch(sendMsg({
          msg: fileName,
          messageType,
          fileUrl,
          fileName,
          clientMessageId,
        }))

        const res = await chatApi.sendMessage({
          to,
          content: fileName,
          messageType,
          fileUrl,
          fileName,
          fileSize,
          fileMimeType,
          clientMessageId,
        })

        dispatch(confirmMsgSent({
          clientMessageId,
          messageId: res.data.data._id,
          status: res.data.data.status,
        }))
      } else if (text?.trim()) {
        dispatch(sendMsg({ msg: text.trim(), clientMessageId }))

        sendMessage({
          from: session.user.id,
          to,
          content: text.trim(),
          messageType: 'text',
          clientMessageId,
        })
      }
    } catch {
      toast.error('Failed to send message')
    }

    emitTyping(to, false)
  }

  const handleTyping = (isTyping) => {
    if (!chatStore.activeUser) return
    const to = chatStore.activeUser.id
    emitTyping(to, isTyping)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => emitTyping(to, false), 2000)
    }
  }

  const handleEditMessage = (messageId, newContent) => {
    editMessage(messageId, session.user.id, newContent)
  }

  const handleDeleteMessage = (messageId) => {
    deleteMessage(messageId, session.user.id)
  }

  const handleAddReaction = (messageId, emoji) => {
    addReaction(messageId, session.user.id, emoji)
  }

  const handleCreateChat = useCallback((contact) => {
    if (!contact?.id) return
    dispatch(addNewChat({ id: contact.id }))
    activeUser(contact.id)
    if (isBelowMdScreen) {
      setSidebarOpen(false)
      setBackdropOpen(false)
    }
  }, [dispatch, activeUser, isBelowMdScreen])

  const existingChatUserIds = chatStore.chats.map(c => c.userId?.toString())

  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered',
      })}
    >
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
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
        onOpenNewChat={() => setNewChatOpen(true)}
      />

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        contacts={chatStore.contacts}
        existingChatUserIds={existingChatUserIds}
        onSelectContact={handleCreateChat}
        onRefreshContacts={refreshContacts}
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}

export default ChatWrapper
