import { PremiumSellerAuthForm } from '@/components/auth/PremiumSellerAuthForm'

export default async function SellerLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <PremiumSellerAuthForm type="seller-login" error={params.error} />
}
