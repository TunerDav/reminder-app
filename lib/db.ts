import { PrismaClient } from "./generated/prisma"

function createPrismaClient() {
  // Use standard Prisma client - it works with PostgreSQL via DATABASE_URL
  // The adapter is only needed for edge runtimes, not for Node.js
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Legacy SQL export for backward compatibility (using Prisma's raw queries)
export const sql = {
  query: async (text: string, params?: any[]) => {
    return prisma.$queryRawUnsafe(text, ...(params || []))
  }
}

export type Congregation = {
  id: number
  name: string
  city: string | null
  created_at: Date
}

export type Contact = {
  id: number
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  address: string | null
  congregation_id: number | null
  congregation_name?: string | null
  family_id: number | null
  family_name?: string | null
  birthday: string | null
  wedding_anniversary: string | null
  notes: string | null
  photo_url: string | null
  created_at: Date
  updated_at: Date
}

export type Family = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  congregation_id: number | null
  congregation_name?: string | null
  notes: string | null
  photo_url: string | null
  created_at: Date
  updated_at: Date
}

export type ReminderType = "birthday" | "wedding_anniversary" | "call" | "invite" | "visit" | "custom"
export type RepeatInterval = "none" | "weekly" | "monthly" | "quarterly" | "yearly"

export type Reminder = {
  id: number
  contact_id: number | null
  contact_name?: string
  family_ids?: number[]
  family_names?: string[]
  contact_ids?: number[]
  contact_names?: string[]
  type: ReminderType
  title: string
  description: string | null
  due_date: string
  repeat: RepeatInterval
  completed: boolean
  completed_at: Date | null
  created_at: Date
}

export type Interaction = {
  id: number
  contact_id: number | null
  contact_name?: string
  family_id: number | null
  family_name?: string
  type: string
  notes: string | null
  interaction_date: string
  created_at: Date
}

export type Tag = {
  id: number
  name: string
  color: string
  created_at: Date
}

export type ContactWithTags = Contact & {
  tags?: Tag[]
}

export type FamilyWithTags = Family & {
  tags?: Tag[]
  member_count?: number
}

// Type aliases (used in actions.ts)
export type ContactFlat = Contact
export type FamilyFlat = Family
export type TagFlat = Tag
export type ReminderFlat = Reminder

export type EventTemplateFlat = {
  id: number
  name: string
  description: string | null
  category: string | null
  category_label?: string
  recurrence_type: string
  recurrence_interval: number
  recurrence_day_of_week: number | null
  recurrence_day_of_month: number | null
  recurrence_week_of_month: number | null
  time_of_day: string | null
  max_attendees: number
  active: boolean
  created_at: Date
  updated_at: Date
}

export type FamilyWithMembers = Family & {
  tags: Tag[]
  members: ContactWithTags[]
}

export type PeopleGrouped = {
  families: FamilyWithMembers[]
  individuals: ContactWithTags[]
}

export type EventTemplate = EventTemplateFlat
export type RecurrenceType = string

// Invite Groups
export type InviteGroupFlat = {
  id: number
  name: string
  family_id: number | null
  family_name?: string | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

export type InviteGroupWithMembers = InviteGroupFlat & {
  members: Contact[]
}

export type ScoreResult = {
  score: number        // 0-100
  label: string        // "Stark", "Gut", "Schwach", "Kritisch", "Keine Daten"
  color: string        // Tailwind class
  recency: number
  frequency: number
  variety: number
}

export type InviteGroupWithScore = InviteGroupWithMembers & {
  score: ScoreResult
}

export type InteractionFlat = {
  id: number
  contact_id: number | null
  contact_name?: string
  family_id: number | null
  family_name?: string
  invite_group_id: number | null
  type: string
  notes: string | null
  interaction_date: string
  created_at: Date
}

// Event Slot types
export type EventSlotWithDetails = {
  id: number
  event_template_id: number
  event_template_name: string
  event_template_category?: string
  slot_date: string
  slot_time: string | null
  status: string
  notes: string | null
  max_attendees: number
  attendee_count?: number
  available_spots?: number
  contacts: { id: number; first_name: string; last_name: string; response: string | null }[]
  families: { id: number; name: string; response: string | null }[]
  invite_groups?: { id: number; name: string; response: string | null }[]
  template?: { max_attendees: number }
}
