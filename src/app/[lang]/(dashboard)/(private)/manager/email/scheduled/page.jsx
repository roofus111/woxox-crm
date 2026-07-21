'use client';

import EmailListView from '@/views/apps/email-marketing/EmailListView';

export default function ScheduledPage() {
  return <EmailListView folder="scheduled" title="Scheduled" emptyIcon="ri-time-line" emptyText="No scheduled emails" />;
}
