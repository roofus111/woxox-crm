import { redirect } from 'next/navigation';

export default function NewCampaignPage({ params }) {
  redirect(`/${params.lang}/manager/email/campaigns`);
}
