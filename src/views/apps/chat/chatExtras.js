export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉', '🙏', '✅', '❌', '👀']

export const draftKey = (peerId, peerType = 'user') => `chat_draft_${peerType}_${peerId}`

export const loadDraft = (peerId, peerType = 'user') => {
  if (typeof window === 'undefined' || !peerId) return ''
  try {
    return localStorage.getItem(draftKey(peerId, peerType)) || ''
  } catch {
    return ''
  }
}

export const saveDraft = (peerId, text, peerType = 'user') => {
  if (typeof window === 'undefined' || !peerId) return
  try {
    if (!text?.trim()) localStorage.removeItem(draftKey(peerId, peerType))
    else localStorage.setItem(draftKey(peerId, peerType), text)
  } catch {
    // ignore quota errors
  }
}

export const parseMentions = (text, contacts = []) => {
  if (!text) return []
  const ids = []
  contacts.forEach(contact => {
    const name = contact.fullName || contact.name
    if (!name) return
    const pattern = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (pattern.test(text)) ids.push(contact.id)
  })
  return [...new Set(ids)]
}

export const highlightMentions = (text) => {
  if (!text) return text
  return text
}
