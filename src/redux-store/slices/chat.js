import { createSlice } from '@reduxjs/toolkit'

const AVATAR_COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info']

export const mapUserToContact = (user) => ({
  id: user._id || user.userId || user.id,
  fullName: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  role: user.role || 'User',
  about: user.about || '',
  avatar: user.avatar || user.profileImage?.fileUrl || null,
  avatarColor: AVATAR_COLORS[(user._id || user.id || '').toString().charCodeAt(0) % AVATAR_COLORS.length],
  status: user.status || 'offline',
})

export const mapMessageToChat = (msg, currentUserId) => {
  const senderId = (msg.from?._id || msg.from)?.toString()
  const status = msg.status || 'sent'

  return {
    messageId: msg._id || msg.messageId,
    message: msg.content || msg.message || '',
    time: msg.createdAt || msg.timestamp || new Date(),
    senderId,
    messageType: msg.messageType || 'text',
    fileUrl: msg.fileUrl,
    fileName: msg.fileName,
    edited: msg.edited || false,
    reactions: msg.reactions || [],
    msgStatus: {
      isSent: true,
      isDelivered: status === 'delivered' || status === 'read',
      isSeen: status === 'read',
    },
  }
}

const initialState = {
  profileUser: {
    id: null,
    avatar: null,
    fullName: '',
    role: '',
    about: '',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: false,
      isNotificationsOn: true,
    },
  },
  contacts: [],
  chats: [],
  activeUser: null,
  loading: false,
  typingUserId: null,
}

const findOrCreateChat = (state, userId) => {
  const id = userId?.toString()
  let chat = state.chats.find(c => c.userId?.toString() === id)
  if (!chat) {
    chat = { id, userId: id, unseenMsgs: 0, chat: [] }
    state.chats.unshift(chat)
  }
  return chat
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setProfileUser: (state, action) => {
      state.profileUser = { ...state.profileUser, ...action.payload }
    },
    setContacts: (state, action) => {
      state.contacts = action.payload
    },
    setConversations: (state, action) => {
      const conversations = action.payload
      conversations.forEach(conv => {
        const userId = conv.userId?.toString()
        if (!userId) return

        const contact = mapUserToContact(conv.user)
        if (!state.contacts.find(c => c.id === userId)) {
          state.contacts.push(contact)
        }

        const chat = findOrCreateChat(state, userId)
        chat.unseenMsgs = conv.conversationStats?.unreadCount || 0

        if (conv.lastMessage && chat.chat.length === 0) {
          chat.chat.push(mapMessageToChat(conv.lastMessage, state.profileUser.id))
        }
      })

      state.chats.sort((a, b) => {
        const aTime = a.chat[a.chat.length - 1]?.time || 0
        const bTime = b.chat[b.chat.length - 1]?.time || 0
        return new Date(bTime) - new Date(aTime)
      })
    },
    setChatHistory: (state, action) => {
      const { userId, messages } = action.payload
      const chat = findOrCreateChat(state, userId)
      chat.chat = messages.map(m => mapMessageToChat(m, state.profileUser.id))
      chat.unseenMsgs = 0
    },
    getActiveUserData: (state, action) => {
      const userId = action.payload?.toString()
      const activeUser = state.contacts.find(user => user.id?.toString() === userId)
      const chat = state.chats.find(c => c.userId?.toString() === userId)

      if (chat) chat.unseenMsgs = 0
      if (activeUser) state.activeUser = activeUser
    },
    addNewChat: (state, action) => {
      const userId = action.payload.id?.toString()
      if (!userId) return

      const chat = findOrCreateChat(state, userId)
      state.chats = [chat, ...state.chats.filter(c => c.userId?.toString() !== userId)]

      const activeUser = state.contacts.find(c => c.id?.toString() === userId)
      if (activeUser) state.activeUser = activeUser
    },
    setUserStatus: (state, action) => {
      state.profileUser.status = action.payload.status
    },
    updateContactStatus: (state, action) => {
      const { userId, status } = action.payload
      const id = userId?.toString()
      const contact = state.contacts.find(c => c.id?.toString() === id)
      if (contact) contact.status = status
      if (state.activeUser?.id?.toString() === id) {
        state.activeUser.status = status
      }
    },
    setOnlineUsers: (state, action) => {
      const onlineIds = new Set((action.payload || []).map(id => id.toString()))
      state.contacts.forEach(contact => {
        contact.status = onlineIds.has(contact.id?.toString()) ? 'online' : 'offline'
      })
      if (state.activeUser) {
        state.activeUser.status = onlineIds.has(state.activeUser.id?.toString()) ? 'online' : 'offline'
      }
    },
    setTypingUser: (state, action) => {
      state.typingUserId = action.payload.isTyping ? action.payload.userId : null
    },
    sendMsg: (state, action) => {
      const { msg, messageType, fileUrl, fileName, messageId, clientMessageId } = action.payload
      if (!state.activeUser) return

      const userId = state.activeUser.id?.toString()
      const chat = findOrCreateChat(state, userId)

      chat.chat.push({
        messageId: messageId || clientMessageId,
        clientMessageId,
        message: msg,
        time: new Date(),
        senderId: state.profileUser.id,
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        msgStatus: { isSent: true, isDelivered: false, isSeen: false },
      })

      state.chats = [chat, ...state.chats.filter(c => c.userId?.toString() !== userId)]
    },
    receiveMsg: (state, action) => {
      const data = action.payload
      const fromId = (data.from?._id || data.from)?.toString()
      const toId = (data.to?._id || data.to)?.toString()
      const currentUserId = state.profileUser.id?.toString()
      const otherUserId = fromId === currentUserId ? toId : fromId

      if (!otherUserId) return

      if (!state.contacts.find(c => c.id?.toString() === otherUserId) && data.from && typeof data.from === 'object') {
        state.contacts.push(mapUserToContact(data.from._id === otherUserId ? data.from : data.to))
      }

      const chat = findOrCreateChat(state, otherUserId)
      const existingId = data.messageId?.toString()

      if (existingId && chat.chat.some(m => m.messageId?.toString() === existingId)) return
      if (data.clientMessageId && chat.chat.some(m => m.clientMessageId === data.clientMessageId)) return

      chat.chat.push(mapMessageToChat(data, currentUserId))

      if (state.activeUser?.id?.toString() !== otherUserId) {
        chat.unseenMsgs = (chat.unseenMsgs || 0) + 1
      }

      state.chats = [chat, ...state.chats.filter(c => c.userId?.toString() !== otherUserId)]
    },
    confirmMsgSent: (state, action) => {
      const { clientMessageId, messageId, status } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.clientMessageId === clientMessageId || m.messageId === clientMessageId)
        if (msg) {
          if (messageId) msg.messageId = messageId
          if (status === 'delivered') msg.msgStatus.isDelivered = true
          break
        }
      }
    },
    updateMsgStatus: (state, action) => {
      const { messageId, status } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.messageId?.toString() === messageId?.toString())
        if (msg) {
          if (status === 'delivered' || status === 'read') msg.msgStatus.isDelivered = true
          if (status === 'read') msg.msgStatus.isSeen = true
          break
        }
      }
    },
    editMsg: (state, action) => {
      const { messageId, newContent } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.messageId?.toString() === messageId?.toString())
        if (msg) {
          msg.message = newContent
          msg.edited = true
          break
        }
      }
    },
    deleteMsg: (state, action) => {
      const { messageId } = action.payload
      for (const chat of state.chats) {
        chat.chat = chat.chat.filter(m => m.messageId?.toString() !== messageId?.toString())
      }
    },
    addMsgReaction: (state, action) => {
      const { messageId, userId, emoji } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.messageId?.toString() === messageId?.toString())
        if (msg) {
          const existing = msg.reactions?.find(r => r.user?.toString() === userId?.toString())
          if (existing) existing.emoji = emoji
          else msg.reactions = [...(msg.reactions || []), { user: userId, emoji }]
          break
        }
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    clearChat: (state, action) => {
      const userId = action.payload?.toString()
      const chat = state.chats.find(c => c.userId?.toString() === userId)
      if (chat) chat.chat = []
    },
  },
})

export const {
  setProfileUser,
  setContacts,
  setConversations,
  setChatHistory,
  getActiveUserData,
  addNewChat,
  setUserStatus,
  updateContactStatus,
  setOnlineUsers,
  setTypingUser,
  sendMsg,
  receiveMsg,
  confirmMsgSent,
  updateMsgStatus,
  editMsg,
  deleteMsg,
  addMsgReaction,
  setLoading,
  clearChat,
} = chatSlice.actions

export default chatSlice.reducer
