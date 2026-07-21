import axios from 'axios';

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${getBaseUrl()}/api/message/upload`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
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
};

export default chatApi;
