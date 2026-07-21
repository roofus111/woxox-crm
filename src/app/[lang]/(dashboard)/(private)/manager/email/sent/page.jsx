'use client';

import EmailListView from '@/views/apps/email-marketing/EmailListView';

export default function SentPage() {
  return <EmailListView folder="sent" title="Sent" emptyIcon="ri-send-plane-line" emptyText="No sent emails yet" />;
}
