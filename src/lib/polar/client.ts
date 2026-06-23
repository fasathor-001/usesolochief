import { Polar } from '@polar-sh/sdk'

let polarClient: Polar | null = null

export function getPolarClient(): Polar {
  if (!polarClient) {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error('POLAR_ACCESS_TOKEN is not set')
    }
    polarClient = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    })
  }
  return polarClient
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    productId: null,
  },
  pro: {
    name: 'Pro',
    price: 15,
    productId: process.env.POLAR_PRO_PRODUCT_ID!,
  },
  operator: {
    name: 'Operator',
    price: 24,
    productId: process.env.POLAR_OPERATOR_PRODUCT_ID!,
  },
} as const

export type Plan = keyof typeof PLANS
