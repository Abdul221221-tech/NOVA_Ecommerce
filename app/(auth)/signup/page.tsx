import { PremiumCustomerAuthForm } from '@/components/auth/PremiumCustomerAuthForm'

export default async function CustomerSignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <PremiumCustomerAuthForm type="customer-signup" error={params.error} />
}
