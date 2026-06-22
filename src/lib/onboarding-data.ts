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
  personal_family: [
    { title: 'Health & fitness',    category: 'personal', stage: 'main_focus',  permission_level: 'can_interrupt',   priority: 1 },
    { title: 'Family admin',        category: 'personal', stage: 'active',       permission_level: 'protected_block', priority: 2 },
    { title: 'Finance follow-ups',  category: 'finance',  stage: 'follow_up',    permission_level: 'follow_up_only',  priority: 3 },
    { title: 'Personal goals',      category: 'personal', stage: 'active',       permission_level: 'protected_block', priority: 4 },
    { title: 'Home and errands',    category: 'personal', stage: 'follow_up',    permission_level: 'follow_up_only',  priority: 5 },
  ],
  scratch: [],
}

export const TEMPLATE_LABELS: Record<OnboardingTemplate, string> = {
  solo_founder:    'Founder / Builder',
  freelancer:      'Freelancer / Consultant',
  student_builder: 'Student',
  creator:         'Creator',
  professional:    'Professional',
  personal_family: 'Personal / Family',
  scratch:         'Start from scratch',
}

export const TEMPLATE_DESCRIPTIONS: Record<OnboardingTemplate, string> = {
  solo_founder:    'Managing a business, project, product, or venture — and everything around it.',
  freelancer:      'Managing clients, deadlines, proposals, invoices, and follow-ups.',
  student_builder: 'Managing assignments, exams, work, personal admin, and everything else you are carrying.',
  creator:         'Managing content, ideas, publishing, brand deals, and audience commitments.',
  professional:    'Managing work projects, deadlines, meetings, and personal responsibilities.',
  personal_family: 'Managing home, family, health, finance, errands, and personal responsibilities.',
  scratch:         'Build your own setup without suggestions.',
}
