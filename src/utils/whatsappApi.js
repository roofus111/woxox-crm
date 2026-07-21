import axios from 'axios';

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const whatsappApi = {
  getSettings: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/settings`, { headers: getAuthHeaders() }),

  updateSettings: (data) =>
    axios.put(`${getBaseUrl()}/api/whatsapp/settings`, data, { headers: getAuthHeaders() }),

  testConnection: () =>
    axios.post(`${getBaseUrl()}/api/whatsapp/settings/test`, {}, { headers: getAuthHeaders() }),

  getConversations: (params) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/conversations`, {
      headers: getAuthHeaders(),
      params,
    }),

  getConversation: (id) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/conversations/${id}`, { headers: getAuthHeaders() }),

  getMessages: (conversationId, params) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
      params,
    }),

  sendMessage: (conversationId, data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/messages`, data, {
      headers: getAuthHeaders(),
    }),

  markRead: (conversationId) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/read`, {}, {
      headers: getAuthHeaders(),
    }),

  assignConversation: (conversationId, data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/assign`, data, {
      headers: getAuthHeaders(),
    }),

  updateConversationStatus: (conversationId, status) =>
    axios.patch(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/status`, { status }, {
      headers: getAuthHeaders(),
    }),

  getContactProfile: (conversationId) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/conversations/${conversationId}/profile`, {
      headers: getAuthHeaders(),
    }),

  getQuickReplies: (params) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/quick-replies`, {
      headers: getAuthHeaders(),
      params,
    }),

  createQuickReply: (data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/quick-replies`, data, { headers: getAuthHeaders() }),

  getTemplates: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/templates`, { headers: getAuthHeaders() }),

  createTemplate: (data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/templates`, data, { headers: getAuthHeaders() }),

  syncTemplates: () =>
    axios.post(`${getBaseUrl()}/api/whatsapp/templates/sync`, {}, { headers: getAuthHeaders() }),

  getBroadcasts: (params) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/broadcasts`, { headers: getAuthHeaders(), params }),

  createBroadcast: (data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/broadcasts`, data, { headers: getAuthHeaders() }),

  previewBroadcast: (filters) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/broadcasts/preview`, { filters }, {
      headers: getAuthHeaders(),
    }),

  getCampaigns: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/campaigns`, { headers: getAuthHeaders() }),

  createCampaign: (data) =>
    axios.post(`${getBaseUrl()}/api/whatsapp/campaigns`, data, { headers: getAuthHeaders() }),

  getReports: (params) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/reports`, { headers: getAuthHeaders(), params }),

  getTimeline: (leadId) =>
    axios.get(`${getBaseUrl()}/api/whatsapp/timeline/${leadId}`, { headers: getAuthHeaders() }),

  getAutomations: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/automations`, { headers: getAuthHeaders() }),

  getChatbotFlows: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/chatbot-flows`, { headers: getAuthHeaders() }),

  getScheduled: () =>
    axios.get(`${getBaseUrl()}/api/whatsapp/scheduled`, { headers: getAuthHeaders() }),
};

export default whatsappApi;
