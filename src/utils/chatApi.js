import axios from 'axios';
import { syncAuthTokenFromSession } from '@/libs/apiAuth';

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Keep localStorage token in sync with NextAuth before chat API calls. */
export function ensureChatAuth(accessToken) {
  if (accessToken) syncAuthTokenFromSession(accessToken);
}

const chatApi = {
  getContacts: () =>
    axios.get(`${getBaseUrl()}/api/message/contacts`, { headers: getAuthHeaders() }),

  getOnlineUsers: () =>
    axios.get(`${getBaseUrl()}/api/message/online-users`, { headers: getAuthHeaders() }),

  getTeamMembers: () =>
    axios.get(`${getBaseUrl()}/api/user-profiles/users/active`, { headers: getAuthHeaders() }),

  getConversations: (params) =>
    axios.get(`${getBaseUrl()}/api/message/conversations`, {
      headers: getAuthHeaders(),
      params,
    }),

  getMessages: (withUserId, params) =>
    axios.get(`${getBaseUrl()}/api/message/history/${withUserId}`, {
      headers: getAuthHeaders(),
      params,
    }),

  sendMessage: (data) =>
    axios.post(`${getBaseUrl()}/api/message/send`, data, { headers: getAuthHeaders() }),

  forwardMessage: (data) =>
    axios.post(`${getBaseUrl()}/api/message/forward`, data, { headers: getAuthHeaders() }),

  searchMessages: (params) =>
    axios.get(`${getBaseUrl()}/api/message/search`, {
      headers: getAuthHeaders(),
      params,
    }),

  getPreferences: () =>
    axios.get(`${getBaseUrl()}/api/message/preferences`, { headers: getAuthHeaders() }),

  updatePreference: (peerId, data) =>
    axios.put(`${getBaseUrl()}/api/message/preferences/${peerId}`, data, {
      headers: getAuthHeaders(),
    }),

  toggleStar: (messageId) =>
    axios.post(`${getBaseUrl()}/api/message/star/${messageId}`, {}, { headers: getAuthHeaders() }),

  getStarred: () =>
    axios.get(`${getBaseUrl()}/api/message/starred`, { headers: getAuthHeaders() }),

  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${getBaseUrl()}/api/message/upload`, formData, {
      headers: { ...getAuthHeaders() },
    });
  },

  markConversationRead: (withUserId) =>
    axios.put(`${getBaseUrl()}/api/message/read-conversation/${withUserId}`, {}, {
      headers: getAuthHeaders(),
    }),

  markAsRead: (messageId) =>
    axios.put(`${getBaseUrl()}/api/message/read/${messageId}`, {}, {
      headers: getAuthHeaders(),
    }),

  editMessage: (messageId, newContent) =>
    axios.put(`${getBaseUrl()}/api/message/${messageId}`, { newContent }, {
      headers: getAuthHeaders(),
    }),

  deleteMessage: (messageId) =>
    axios.delete(`${getBaseUrl()}/api/message/${messageId}`, {
      headers: getAuthHeaders(),
    }),

  addReaction: (messageId, emoji) =>
    axios.post(`${getBaseUrl()}/api/message/reaction/${messageId}`, { emoji }, {
      headers: getAuthHeaders(),
    }),

  removeReaction: (messageId) =>
    axios.delete(`${getBaseUrl()}/api/message/reaction/${messageId}`, {
      headers: getAuthHeaders(),
    }),

  listGroups: () =>
    axios.get(`${getBaseUrl()}/api/chat-groups`, { headers: getAuthHeaders() }),

  createGroup: (data) =>
    axios.post(`${getBaseUrl()}/api/chat-groups`, data, { headers: getAuthHeaders() }),

  getGroup: (groupId) =>
    axios.get(`${getBaseUrl()}/api/chat-groups/${groupId}`, { headers: getAuthHeaders() }),

  updateGroup: (groupId, data) =>
    axios.put(`${getBaseUrl()}/api/chat-groups/${groupId}`, data, { headers: getAuthHeaders() }),

  addGroupMembers: (groupId, memberIds) =>
    axios.post(`${getBaseUrl()}/api/chat-groups/${groupId}/members`, { memberIds }, {
      headers: getAuthHeaders(),
    }),

  leaveGroup: (groupId) =>
    axios.post(`${getBaseUrl()}/api/chat-groups/${groupId}/leave`, {}, { headers: getAuthHeaders() }),

  getGroupMessages: (groupId, params) =>
    axios.get(`${getBaseUrl()}/api/chat-groups/${groupId}/messages`, {
      headers: getAuthHeaders(),
      params,
    }),

  sendGroupMessage: (groupId, data) =>
    axios.post(`${getBaseUrl()}/api/chat-groups/${groupId}/messages`, data, {
      headers: getAuthHeaders(),
    }),
};

export default chatApi;
