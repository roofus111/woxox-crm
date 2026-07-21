import { redirect } from 'next/navigation'

export default function Page({ params }) {
  redirect(`/${params.lang}/apps/legalos/dashboard`)
}
