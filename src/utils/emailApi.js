import axios from 'axios';

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const emailApi = {
  // Dashboard
  getDashboard: () =>
    axios.get(`${getBaseUrl()}/api/email/dashboard`, { headers: getAuthHeaders() }),

  // Templates
  getTemplates: (params) =>
    axios.get(`${getBaseUrl()}/api/email/templates`, { headers: getAuthHeaders(), params }),
  getTemplate: (id) =>
    axios.get(`${getBaseUrl()}/api/email/templates/${id}`, { headers: getAuthHeaders() }),
  createTemplate: (data) =>
    axios.post(`${getBaseUrl()}/api/email/templates`, data, { headers: getAuthHeaders() }),
  updateTemplate: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/templates/${id}`, data, { headers: getAuthHeaders() }),
  duplicateTemplate: (id) =>
    axios.post(`${getBaseUrl()}/api/email/templates/${id}/duplicate`, {}, { headers: getAuthHeaders() }),
  deleteTemplate: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/templates/${id}`, { headers: getAuthHeaders() }),
  seedTemplates: () =>
    axios.post(`${getBaseUrl()}/api/email/templates/seed`, {}, { headers: getAuthHeaders() }),
  exportMjml: (id) =>
    axios.get(`${getBaseUrl()}/api/email/templates/${id}/export-mjml`, { headers: getAuthHeaders() }),

  // Campaigns
  getCampaigns: (params) =>
    axios.get(`${getBaseUrl()}/api/email/campaigns`, { headers: getAuthHeaders(), params }),
  getCampaign: (id) =>
    axios.get(`${getBaseUrl()}/api/email/campaigns/${id}`, { headers: getAuthHeaders() }),
  createCampaign: (data) =>
    axios.post(`${getBaseUrl()}/api/email/campaigns`, data, { headers: getAuthHeaders() }),
  launchCampaign: (id) =>
    axios.post(`${getBaseUrl()}/api/email/campaigns/${id}/launch`, {}, { headers: getAuthHeaders() }),
  updateCampaignStatus: (id, status) =>
    axios.patch(`${getBaseUrl()}/api/email/campaigns/${id}/status`, { status }, { headers: getAuthHeaders() }),
  updateCampaign: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/campaigns/${id}`, data, { headers: getAuthHeaders() }),
  deleteCampaign: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/campaigns/${id}`, { headers: getAuthHeaders() }),
  getCampaignAnalytics: (id) =>
    axios.get(`${getBaseUrl()}/api/email/campaigns/${id}/analytics`, { headers: getAuthHeaders() }),

  // Emails
  getEmails: (params) =>
    axios.get(`${getBaseUrl()}/api/email/emails`, { headers: getAuthHeaders(), params }),
  getEmail: (id) =>
    axios.get(`${getBaseUrl()}/api/email/emails/${id}`, { headers: getAuthHeaders() }),
  sendEmail: (data) =>
    axios.post(`${getBaseUrl()}/api/email/emails/send`, data, { headers: getAuthHeaders() }),
  sendTestEmail: (data) =>
    axios.post(`${getBaseUrl()}/api/email/emails/test`, data, { headers: getAuthHeaders() }),
  updateEmailFlags: (id, data) =>
    axios.patch(`${getBaseUrl()}/api/email/emails/${id}`, data, { headers: getAuthHeaders() }),
  deleteEmail: (id, permanent = false) =>
    axios.delete(`${getBaseUrl()}/api/email/emails/${id}`, {
      headers: getAuthHeaders(),
      params: permanent ? { permanent: 'true' } : {},
    }),
  getDrafts: (params) =>
    axios.get(`${getBaseUrl()}/api/email/drafts`, { headers: getAuthHeaders(), params }),
  saveDraft: (data) =>
    axios.post(`${getBaseUrl()}/api/email/drafts`, data, { headers: getAuthHeaders() }),
  getDraft: (id) =>
    axios.get(`${getBaseUrl()}/api/email/drafts/${id}`, { headers: getAuthHeaders() }),
  deleteDraft: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/drafts/${id}`, { headers: getAuthHeaders() }),
  getLeadTimeline: (leadId) =>
    axios.get(`${getBaseUrl()}/api/email/timeline/${leadId}`, { headers: getAuthHeaders() }),

  // Analytics
  getAnalytics: (params) =>
    axios.get(`${getBaseUrl()}/api/email/analytics`, { headers: getAuthHeaders(), params }),

  // SMTP
  getSmtpAccounts: () =>
    axios.get(`${getBaseUrl()}/api/email/smtp`, { headers: getAuthHeaders() }),
  createSmtpAccount: (data) =>
    axios.post(`${getBaseUrl()}/api/email/smtp`, data, { headers: getAuthHeaders() }),
  updateSmtpAccount: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/smtp/${id}`, data, { headers: getAuthHeaders() }),
  deleteSmtpAccount: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/smtp/${id}`, { headers: getAuthHeaders() }),
  testSmtpAccount: (id) =>
    axios.post(`${getBaseUrl()}/api/email/smtp/${id}/test`, {}, { headers: getAuthHeaders() }),

  // Domains
  getDomains: () =>
    axios.get(`${getBaseUrl()}/api/email/domains`, { headers: getAuthHeaders() }),
  addDomain: (domain) =>
    axios.post(`${getBaseUrl()}/api/email/domains`, { domain }, { headers: getAuthHeaders() }),
  verifyDomain: (id) =>
    axios.post(`${getBaseUrl()}/api/email/domains/${id}/verify`, {}, { headers: getAuthHeaders() }),
  deleteDomain: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/domains/${id}`, { headers: getAuthHeaders() }),

  // Lists
  getLists: (params) =>
    axios.get(`${getBaseUrl()}/api/email/lists`, { headers: getAuthHeaders(), params }),
  getList: (id) =>
    axios.get(`${getBaseUrl()}/api/email/lists/${id}`, { headers: getAuthHeaders() }),
  createList: (data) =>
    axios.post(`${getBaseUrl()}/api/email/lists`, data, { headers: getAuthHeaders() }),
  updateList: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/lists/${id}`, data, { headers: getAuthHeaders() }),
  deleteList: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/lists/${id}`, { headers: getAuthHeaders() }),
  importLeadsToList: (id) =>
    axios.post(`${getBaseUrl()}/api/email/lists/${id}/import-leads`, {}, { headers: getAuthHeaders() }),

  // Segments
  getSegments: (params) =>
    axios.get(`${getBaseUrl()}/api/email/segments`, { headers: getAuthHeaders(), params }),
  getSegment: (id) =>
    axios.get(`${getBaseUrl()}/api/email/segments/${id}`, { headers: getAuthHeaders() }),
  createSegment: (data) =>
    axios.post(`${getBaseUrl()}/api/email/segments`, data, { headers: getAuthHeaders() }),
  updateSegment: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/segments/${id}`, data, { headers: getAuthHeaders() }),
  deleteSegment: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/segments/${id}`, { headers: getAuthHeaders() }),
  previewSegment: (rules) =>
    axios.post(`${getBaseUrl()}/api/email/segments/preview`, { rules }, { headers: getAuthHeaders() }),

  // Automation
  getAutomations: (params) =>
    axios.get(`${getBaseUrl()}/api/email/automations`, { headers: getAuthHeaders(), params }),
  getAutomation: (id) =>
    axios.get(`${getBaseUrl()}/api/email/automations/${id}`, { headers: getAuthHeaders() }),
  createAutomation: (data) =>
    axios.post(`${getBaseUrl()}/api/email/automations`, data, { headers: getAuthHeaders() }),
  updateAutomation: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/automations/${id}`, data, { headers: getAuthHeaders() }),
  updateAutomationStatus: (id, status) =>
    axios.patch(`${getBaseUrl()}/api/email/automations/${id}/status`, { status }, { headers: getAuthHeaders() }),
  deleteAutomation: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/automations/${id}`, { headers: getAuthHeaders() }),

  // IMAP & OAuth
  getImapStatus: () =>
    axios.get(`${getBaseUrl()}/api/email/imap/status`, { headers: getAuthHeaders() }),
  syncImap: (accountId) =>
    axios.post(`${getBaseUrl()}/api/email/imap/sync/${accountId}`, {}, { headers: getAuthHeaders() }),
  configureImap: (accountId, data) =>
    axios.put(`${getBaseUrl()}/api/email/imap/${accountId}`, data, { headers: getAuthHeaders() }),
  getOAuthUrls: () =>
    axios.get(`${getBaseUrl()}/api/email/oauth/urls`, { headers: getAuthHeaders() }),

  // Email testing & heatmaps
  runEmailChecks: (data) =>
    axios.post(`${getBaseUrl()}/api/email/emails/check`, data, { headers: getAuthHeaders() }),
  getEmailHeatmap: (emailId) =>
    axios.get(`${getBaseUrl()}/api/email/emails/${emailId}/heatmap`, { headers: getAuthHeaders() }),
  getCampaignHeatmap: (campaignId) =>
    axios.get(`${getBaseUrl()}/api/email/campaigns/${campaignId}/heatmap`, { headers: getAuthHeaders() }),
  evaluateAbWinner: (campaignId) =>
    axios.post(`${getBaseUrl()}/api/email/campaigns/${campaignId}/ab-test/evaluate`, {}, { headers: getAuthHeaders() }),

  // Suppression
  getSuppression: () =>
    axios.get(`${getBaseUrl()}/api/email/suppression`, { headers: getAuthHeaders() }),
  addSuppression: (data) =>
    axios.post(`${getBaseUrl()}/api/email/suppression`, data, { headers: getAuthHeaders() }),
  deleteSuppression: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/suppression/${id}`, { headers: getAuthHeaders() }),

  // Settings
  getSettings: () =>
    axios.get(`${getBaseUrl()}/api/email/settings`, { headers: getAuthHeaders() }),
  updateSettings: (data) =>
    axios.put(`${getBaseUrl()}/api/email/settings`, data, { headers: getAuthHeaders() }),
  getLogs: (params) =>
    axios.get(`${getBaseUrl()}/api/email/logs`, { headers: getAuthHeaders(), params }),
  getWebhooks: () =>
    axios.get(`${getBaseUrl()}/api/email/webhooks`, { headers: getAuthHeaders() }),
  createWebhook: (data) =>
    axios.post(`${getBaseUrl()}/api/email/webhooks`, data, { headers: getAuthHeaders() }),
  updateWebhook: (id, data) =>
    axios.put(`${getBaseUrl()}/api/email/webhooks/${id}`, data, { headers: getAuthHeaders() }),
  deleteWebhook: (id) =>
    axios.delete(`${getBaseUrl()}/api/email/webhooks/${id}`, { headers: getAuthHeaders() }),

  // Attachments
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${getBaseUrl()}/api/email/attachments`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default emailApi;
