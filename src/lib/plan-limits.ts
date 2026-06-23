export const PLAN_LIMITS = {
  free: {
    maxCommitments: 3,
    hasAI: false,
    hasWhatsApp: false,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: false,
  },
  pro: {
    maxCommitments: Infinity,
    hasAI: true,
    hasWhatsApp: false,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: true,
  },
  operator: {
    maxCommitments: Infinity,
    hasAI: true,
    hasWhatsApp: true,
    hasPatternIntelligence: false,
    hasCustomAgents: false,
    hasEmailReminders: true,
  },
  chief: {
    maxCommitments: Infinity,
    hasAI: true,
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

export function canUseAI(plan: string): boolean {
  return getPlanLimits(plan).hasAI
}

export function canUseWhatsApp(plan: string): boolean {
  return getPlanLimits(plan).hasWhatsApp
}
