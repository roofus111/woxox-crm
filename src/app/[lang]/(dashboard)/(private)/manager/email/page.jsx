import { redirect } from 'next/navigation';

export default function EmailIndexPage({ params }) {
  redirect(`/${params.lang}/manager/email/dashboard`);
}
