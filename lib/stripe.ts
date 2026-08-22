import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-07-29.dahlia' // Use a recent stable API version
})

export const PLATFORM_FEE_PERCENTAGE = 0.10 // 10% platform fee
