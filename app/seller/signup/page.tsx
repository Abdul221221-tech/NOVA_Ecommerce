import { PremiumSellerAuthForm } from '@/components/auth/PremiumSellerAuthForm'

export default async function SellerSignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <PremiumSellerAuthForm type="seller-signup" error={params.error} />
}
