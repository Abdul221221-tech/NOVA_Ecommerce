import { PremiumCustomerAuthForm } from '@/components/auth/PremiumCustomerAuthForm'

export default async function CustomerLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <PremiumCustomerAuthForm type="customer-login" error={params.error} />
}
