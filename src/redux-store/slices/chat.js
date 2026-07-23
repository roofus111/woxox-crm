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

export const mapGroupToContact = (group) => ({
  id: group._id || group.id,
  fullName: group.name,
  role: 'Group',
  about: group.description || '',
  avatar: group.avatar || null,
  avatarColor: 'info',
  status: 'online',
  isGroup: true,
  memberCount: group.members?.length || 0,
  members: group.members || [],
})

export const mapMessageToChat = (msg, currentUserId) => {
  const senderId = (msg.from?._id || msg.from)?.toString()
  const status = msg.status || 'sent'
  const replySource = msg.replyTo
  const replyTo = replySource
    ? {
        messageId: (replySource._id || replySource.messageId || replySource)?.toString(),
        message: replySource.content || replySource.message || replySource.fileName || '',
        messageType: replySource.messageType || 'text',
        fileName: replySource.fileName,
      }
    : null

  return {
    messageId: msg._id || msg.messageId,
    clientMessageId: msg.clientMessageId,
    message: msg.content || msg.message || '',
    time: msg.createdAt || msg.timestamp || new Date(),
    senderId,
    messageType: msg.messageType || 'text',
    fileUrl: msg.fileUrl,
    fileName: msg.fileName,
    edited: msg.edited || false,
    reactions: msg.reactions || [],
    replyTo,
    mentions: msg.mentions || [],
    forwardedFrom: msg.forwardedFrom || null,
    starred: Array.isArray(msg.starredBy)
      ? msg.starredBy.some(id => id?.toString() === currentUserId?.toString())
      : !!msg.starred,
    failed: status === 'failed' || !!msg.failed,
    msgStatus: {
      isSent: status !== 'failed',
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
  groups: [],
  preferences: {},
  chats: [],
  activeUser: null,
  activeChatType: 'user',
  loading: false,
  typingUserId: null,
  hasMoreMessages: false,
  sidebarFilter: 'all',
}

const prefKey = (peerId, peerType = 'user') => `${peerType}:${peerId}`

const findOrCreateChat = (state, peerId, chatType = 'user') => {
  const id = peerId?.toString()
  let chat = state.chats.find(
    c => c.userId?.toString() === id && (c.chatType || 'user') === chatType
  )
  if (!chat) {
    chat = { id: `${chatType}:${id}`, userId: id, chatType, unseenMsgs: 0, chat: [], hasMore: true }
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
    setGroups: (state, action) => {
      state.groups = action.payload
      action.payload.forEach(group => {
        const contact = mapGroupToContact(group)
        const existing = state.contacts.find(c => c.id?.toString() === contact.id?.toString() && c.isGroup)
        if (!existing) state.contacts.push(contact)
        else Object.assign(existing, contact)

        const chat = findOrCreateChat(state, contact.id, 'group')
        if (group.lastMessage && chat.chat.length === 0) {
          chat.chat.push(mapMessageToChat(group.lastMessage, state.profileUser.id))
        }
      })
    },
    setPreferences: (state, action) => {
      const map = {}
      ;(action.payload || []).forEach(p => {
        map[prefKey(p.peerId, p.peerType)] = p
      })
      state.preferences = map
    },
    upsertPreference: (state, action) => {
      const p = action.payload
      state.preferences[prefKey(p.peerId, p.peerType || 'user')] = {
        ...(state.preferences[prefKey(p.peerId, p.peerType || 'user')] || {}),
        ...p,
      }
    },
    setSidebarFilter: (state, action) => {
      state.sidebarFilter = action.payload
    },
    setConversations: (state, action) => {
      const conversations = action.payload
      conversations.forEach(conv => {
        const userId = conv.userId?.toString()
        if (!userId) return

        const contact = mapUserToContact(conv.user)
        if (!state.contacts.find(c => c.id === userId && !c.isGroup)) {
          state.contacts.push(contact)
        }

        const chat = findOrCreateChat(state, userId, 'user')
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
      const { userId, messages, chatType = 'user', hasMore = false } = action.payload
      const chat = findOrCreateChat(state, userId, chatType)
      chat.chat = messages.map(m => mapMessageToChat(m, state.profileUser.id))
      chat.unseenMsgs = 0
      chat.hasMore = hasMore
      state.hasMoreMessages = hasMore
    },
    prependChatHistory: (state, action) => {
      const { userId, messages, chatType = 'user', hasMore = false } = action.payload
      const chat = findOrCreateChat(state, userId, chatType)
      const existingIds = new Set(chat.chat.map(m => m.messageId?.toString()))
      const older = messages
        .map(m => mapMessageToChat(m, state.profileUser.id))
        .filter(m => !existingIds.has(m.messageId?.toString()))
      chat.chat = [...older, ...chat.chat]
      chat.hasMore = hasMore
      state.hasMoreMessages = hasMore
    },
    getActiveUserData: (state, action) => {
      const payload = action.payload
      const userId = (typeof payload === 'object' ? payload.id : payload)?.toString()
      const chatType = typeof payload === 'object' ? payload.chatType || 'user' : 'user'
      const activeUser = state.contacts.find(
        user => user.id?.toString() === userId && (!!user.isGroup === (chatType === 'group'))
      )
      const chat = state.chats.find(
        c => c.userId?.toString() === userId && (c.chatType || 'user') === chatType
      )

      if (chat) chat.unseenMsgs = 0
      if (activeUser) {
        state.activeUser = activeUser
        state.activeChatType = chatType
      }
    },
    addNewChat: (state, action) => {
      const userId = action.payload.id?.toString()
      const chatType = action.payload.chatType || (action.payload.isGroup ? 'group' : 'user')
      if (!userId) return

      if (action.payload.isGroup || chatType === 'group') {
        const contact = mapGroupToContact(action.payload)
        if (!state.contacts.find(c => c.id === userId && c.isGroup)) state.contacts.push(contact)
      }

      const chat = findOrCreateChat(state, userId, chatType)
      state.chats = [chat, ...state.chats.filter(c => !(c.userId?.toString() === userId && (c.chatType || 'user') === chatType))]

      const activeUser = state.contacts.find(
        c => c.id?.toString() === userId && (!!c.isGroup === (chatType === 'group'))
      )
      if (activeUser) {
        state.activeUser = activeUser
        state.activeChatType = chatType
      }
    },
    setUserStatus: (state, action) => {
      state.profileUser.status = action.payload.status
    },
    updateContactStatus: (state, action) => {
      const { userId, status } = action.payload
      const id = userId?.toString()
      const contact = state.contacts.find(c => c.id?.toString() === id && !c.isGroup)
      if (contact) contact.status = status
      if (state.activeUser?.id?.toString() === id && !state.activeUser?.isGroup) {
        state.activeUser.status = status
      }
    },
    setOnlineUsers: (state, action) => {
      const onlineIds = new Set((action.payload || []).map(id => id.toString()))
      state.contacts.forEach(contact => {
        if (!contact.isGroup) {
          contact.status = onlineIds.has(contact.id?.toString()) ? 'online' : 'offline'
        }
      })
      if (state.activeUser && !state.activeUser.isGroup) {
        state.activeUser.status = onlineIds.has(state.activeUser.id?.toString()) ? 'online' : 'offline'
      }
    },
    setTypingUser: (state, action) => {
      state.typingUserId = action.payload.isTyping ? action.payload.userId : null
    },
    sendMsg: (state, action) => {
      const {
        msg,
        messageType,
        fileUrl,
        fileName,
        messageId,
        clientMessageId,
        replyTo,
        mentions,
        peerId,
        chatType,
      } = action.payload
      const userId = (peerId || state.activeUser?.id)?.toString()
      const type = chatType || state.activeChatType || 'user'
      if (!userId) return

      const chat = findOrCreateChat(state, userId, type)

      chat.chat.push({
        messageId: messageId || clientMessageId,
        clientMessageId,
        message: msg,
        time: new Date(),
        senderId: state.profileUser.id,
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        replyTo: replyTo || null,
        mentions: mentions || [],
        failed: false,
        msgStatus: { isSent: true, isDelivered: false, isSeen: false },
      })

      state.chats = [
        chat,
        ...state.chats.filter(c => !(c.userId?.toString() === userId && (c.chatType || 'user') === type)),
      ]
    },
    markMsgFailed: (state, action) => {
      const { clientMessageId } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.clientMessageId === clientMessageId)
        if (msg) {
          msg.failed = true
          msg.msgStatus.isSent = false
          break
        }
      }
    },
    receiveMsg: (state, action) => {
      const data = action.payload
      const fromId = (data.from?._id || data.from)?.toString()
      const toId = (data.to?._id || data.to)?.toString()
      const groupId = (data.groupId?._id || data.groupId)?.toString()
      const currentUserId = state.profileUser.id?.toString()

      if (groupId) {
        const chat = findOrCreateChat(state, groupId, 'group')
        const existingId = (data.messageId || data.message?._id)?.toString()
        if (existingId && chat.chat.some(m => m.messageId?.toString() === existingId)) return
        if (data.clientMessageId && chat.chat.some(m => m.clientMessageId === data.clientMessageId)) return

        const mapped = mapMessageToChat(data.message || data, currentUserId)
        if (!mapped.messageId) mapped.messageId = data.messageId
        chat.chat.push(mapped)

        if (!(state.activeUser?.id?.toString() === groupId && state.activeChatType === 'group')) {
          chat.unseenMsgs = (chat.unseenMsgs || 0) + 1
        }

        state.chats = [
          chat,
          ...state.chats.filter(c => !(c.userId?.toString() === groupId && c.chatType === 'group')),
        ]
        return
      }

      const otherUserId = fromId === currentUserId ? toId : fromId
      if (!otherUserId) return

      if (!state.contacts.find(c => c.id?.toString() === otherUserId && !c.isGroup) && data.from && typeof data.from === 'object') {
        state.contacts.push(mapUserToContact(data.from._id?.toString() === otherUserId ? data.from : data.to))
      }

      const chat = findOrCreateChat(state, otherUserId, 'user')
      const existingId = data.messageId?.toString()

      if (existingId && chat.chat.some(m => m.messageId?.toString() === existingId)) return
      if (data.clientMessageId && chat.chat.some(m => m.clientMessageId === data.clientMessageId)) return

      chat.chat.push(mapMessageToChat(data, currentUserId))

      if (!(state.activeUser?.id?.toString() === otherUserId && state.activeChatType === 'user')) {
        chat.unseenMsgs = (chat.unseenMsgs || 0) + 1
      }

      state.chats = [
        chat,
        ...state.chats.filter(c => !(c.userId?.toString() === otherUserId && (c.chatType || 'user') === 'user')),
      ]
    },
    confirmMsgSent: (state, action) => {
      const { clientMessageId, messageId, status } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.clientMessageId === clientMessageId || m.messageId === clientMessageId)
        if (msg) {
          if (messageId) msg.messageId = messageId
          msg.failed = false
          msg.msgStatus.isSent = true
          if (status === 'delivered') msg.msgStatus.isDelivered = true
          break
        }
      }
    },
    updateMsgStatus: (state, action) => {
      const { messageId, clientMessageId, status } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(
          m =>
            (messageId && m.messageId?.toString() === messageId?.toString()) ||
            (clientMessageId && m.clientMessageId === clientMessageId)
        )
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
          const existing = msg.reactions?.find(r => (r.user?._id || r.user)?.toString() === userId?.toString())
          if (existing) existing.emoji = emoji
          else msg.reactions = [...(msg.reactions || []), { user: userId, emoji }]
          break
        }
      }
    },
    removeMsgReaction: (state, action) => {
      const { messageId, userId } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.messageId?.toString() === messageId?.toString())
        if (msg) {
          msg.reactions = (msg.reactions || []).filter(
            r => (r.user?._id || r.user)?.toString() !== userId?.toString()
          )
          break
        }
      }
    },
    toggleMsgStar: (state, action) => {
      const { messageId, starred } = action.payload
      for (const chat of state.chats) {
        const msg = chat.chat.find(m => m.messageId?.toString() === messageId?.toString())
        if (msg) {
          msg.starred = starred
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
  setGroups,
  setPreferences,
  upsertPreference,
  setSidebarFilter,
  setConversations,
  setChatHistory,
  prependChatHistory,
  getActiveUserData,
  addNewChat,
  setUserStatus,
  updateContactStatus,
  setOnlineUsers,
  setTypingUser,
  sendMsg,
  markMsgFailed,
  receiveMsg,
  confirmMsgSent,
  updateMsgStatus,
  editMsg,
  deleteMsg,
  addMsgReaction,
  removeMsgReaction,
  toggleMsgStar,
  setLoading,
  clearChat,
} = chatSlice.actions

export default chatSlice.reducer
