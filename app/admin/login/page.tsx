import { PremiumAdminAuthForm } from '@/components/auth/PremiumAdminAuthForm'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <PremiumAdminAuthForm error={params.error} />
}
