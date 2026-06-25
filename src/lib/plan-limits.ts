export const PLAN_LIMITS = {
  free: {
    maxCommitments: 3,
    aiChatMonthlyLimit: 10,
    aiReviewSummaryMonthlyLimit: 1,
    hasWhatsApp: false,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: false,
  },
  pro: {
    maxCommitments: Infinity,
    aiChatMonthlyLimit: Infinity,
    aiReviewSummaryMonthlyLimit: Infinity,
    hasWhatsApp: false,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: true,
  },
  operator: {
    maxCommitments: Infinity,
    aiChatMonthlyLimit: Infinity,
    aiReviewSummaryMonthlyLimit: Infinity,
    hasWhatsApp: true,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: true,
  },
  chief: {
    maxCommitments: Infinity,
    aiChatMonthlyLimit: Infinity,
    aiReviewSummaryMonthlyLimit: Infinity,
    hasWhatsApp: true,
    hasPatternIntelligence: true,
    hasCustomAgents: true,
    hasEmailReminders: true,
  },
} as const

export type PlanLimits = typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS]

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free
}

export function canAddCommitment(plan: string, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCount < limits.maxCommitments
}

export function getAIChatLimit(plan: string): number {
  return getPlanLimits(plan).aiChatMonthlyLimit
}

export function getAIReviewSummaryLimit(plan: string): number {
  return getPlanLimits(plan).aiReviewSummaryMonthlyLimit
}

export function canUseWhatsApp(plan: string): boolean {
  return getPlanLimits(plan).hasWhatsApp
}
