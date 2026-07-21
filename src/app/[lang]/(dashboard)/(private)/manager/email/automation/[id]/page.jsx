'use client';

import { useParams } from 'next/navigation';
import AutomationFlowBuilder from '@/views/apps/email-marketing/AutomationFlowBuilder';

export default function AutomationBuilderPage() {
  const params = useParams();
  return <AutomationFlowBuilder automationId={params.id} />;
}
