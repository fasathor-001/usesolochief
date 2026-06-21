import type { CommitmentCategory, CommitmentStage, PermissionLevel, OnboardingTemplate } from '@/types/database'

export interface CommitmentDraft {
  title: string
  category: CommitmentCategory
  stage: CommitmentStage
  permission_level: PermissionLevel
  priority: number
}

export const TEMPLATE_DEFAULTS: Record<OnboardingTemplate, CommitmentDraft[]> = {
  solo_founder: [
    { title: 'Main product', category: 'product', stage: 'main_focus', permission_level: 'can_interrupt', priority: 1 },
    { title: 'Side project', category: 'product', stage: 'active', permission_level: 'protected_block', priority: 2 },
    { title: 'Content / Marketing', category: 'content', stage: 'active', permission_level: 'protected_block', priority: 3 },
    { title: 'Admin follow-ups', category: 'admin', stage: 'follow_up', permission_level: 'follow_up_only', priority: 4 },
    { title: 'New ideas', category: 'idea', stage: 'parked', permission_level: 'parked', priority: 5 },
  ],
  freelancer: [
    { title: 'Primary client', category: 'customer', stage: 'main_focus', permission_level: 'can_interrupt', priority: 1 },
    { title: 'Secondary client', category: 'customer', stage: 'active', permission_level: 'protected_block', priority: 2 },
    { title: 'Business development', category: 'content', stage: 'active', permission_level: 'protected_block', priority: 3 },
    { title: 'Invoicing / Admin', category: 'finance', stage: 'follow_up', permission_level: 'follow_up_only', priority: 4 },
    { title: 'New client ideas', category: 'idea', stage: 'parked', permission_level: 'parked', priority: 5 },
  ],
  student_builder: [
    { title: 'Main project', category: 'product', stage: 'main_focus', permission_level: 'can_interrupt', priority: 1 },
    { title: 'Course / Study', category: 'personal', stage: 'active', permission_level: 'protected_block', priority: 2 },
    { title: 'Side build', category: 'product', stage: 'active', permission_level: 'protected_block', priority: 3 },
    { title: 'Applications / Emails', category: 'admin', stage: 'follow_up', permission_level: 'follow_up_only', priority: 4 },
    { title: 'Ideas backlog', category: 'idea', stage: 'parked', permission_level: 'parked', priority: 5 },
  ],
  creator: [
    { title: 'Main content series', category: 'content', stage: 'main_focus', permission_level: 'can_interrupt', priority: 1 },
    { title: 'Sponsorship / Brand deals', category: 'finance', stage: 'active', permission_level: 'protected_block', priority: 2 },
    { title: 'Community / Audience', category: 'customer', stage: 'active', permission_level: 'protected_block', priority: 3 },
    { title: 'Collabs / Replies', category: 'admin', stage: 'follow_up', permission_level: 'follow_up_only', priority: 4 },
    { title: 'Content ideas', category: 'idea', stage: 'parked', permission_level: 'parked', priority: 5 },
  ],
  professional: [
    { title: 'Key work project', category: 'product', stage: 'main_focus', permission_level: 'can_interrupt', priority: 1 },
    { title: 'Team responsibilities', category: 'admin', stage: 'active', permission_level: 'protected_block', priority: 2 },
    { title: 'Side income', category: 'finance', stage: 'active', permission_level: 'protected_block', priority: 3 },
    { title: 'Pending emails / Replies', category: 'admin', stage: 'follow_up', permission_level: 'follow_up_only', priority: 4 },
    { title: 'Ideas / Learning', category: 'idea', stage: 'parked', permission_level: 'parked', priority: 5 },
  ],
  scratch: [],
}

export const TEMPLATE_LABELS: Record<OnboardingTemplate, string> = {
  solo_founder: 'Solo Founder / Builder',
  freelancer: 'Freelancer',
  student_builder: 'Student Builder',
  creator: 'Creator',
  professional: 'Professional',
  scratch: 'Start from Scratch',
}

export const TEMPLATE_DESCRIPTIONS: Record<OnboardingTemplate, string> = {
  solo_founder: 'Building a product, managing a side project, and staying on top of admin.',
  freelancer: 'Juggling clients, business development, and invoicing.',
  student_builder: 'Studying, building projects, and managing applications.',
  creator: 'Producing content, managing brand deals, and growing an audience.',
  professional: 'Leading work projects while building a side income.',
  scratch: 'Set up your commitments from scratch — no suggestions.',
}
