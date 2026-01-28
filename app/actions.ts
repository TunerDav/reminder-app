"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type {
  ContactFlat, ContactWithTags, FamilyFlat, FamilyWithTags,
  TagFlat, ReminderFlat, InteractionFlat, EventTemplateFlat,
  EventSlotWithDetails, PeopleGrouped, FamilyWithMembers,
  InviteGroupFlat, InviteGroupWithMembers, InviteGroupWithScore, ScoreResult,
} from "@/lib/db"
import type { ReminderType, RepeatInterval } from "@/lib/generated/prisma"
import { DEFAULT_EVENT_CATEGORIES, getCategoryLabel } from "@/lib/event-categories"

// ============================================
// Helpers: Date calculations
// ============================================

/**
 * Get the nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @param weekday - The day of week (0=Sunday, 6=Saturday)
 * @param n - The occurrence (1=first, 2=second, 3=third, 4=fourth, 5=last)
 * @returns The date of the nth weekday, or null if it doesn't exist
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date | null {
  if (n === 5) {
    // Special case: last occurrence of weekday in month
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const lastWeekday = lastDayOfMonth.getDay()
    const diff = (lastWeekday - weekday + 7) % 7
    const date = new Date(year, month + 1, 0 - diff)
    return date.getMonth() === month ? date : null
  }
  
  // Find first occurrence of the weekday in the month
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay()
  const daysUntilTarget = (weekday - firstWeekday + 7) % 7
  const firstOccurrence = 1 + daysUntilTarget
  
  // Calculate the nth occurrence
  const targetDate = firstOccurrence + (n - 1) * 7
  const date = new Date(year, month, targetDate)
  
  // Verify the date is still in the same month
  return date.getMonth() === month ? date : null
}

// ============================================
// Helpers: Prisma → Flat serializable objects
// ============================================

function toDateStr(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString().split("T")[0]
}

function toTimeStr(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString().split("T")[1]?.substring(0, 8) ?? null
}

function flattenContact(c: any): ContactFlat {
  return {
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName,
    phone: c.phone,
    email: c.email,
    address: c.address,
    congregation_id: c.congregationId,
    congregation_name: c.congregation?.name ?? null,
    family_id: c.familyId,
    family_name: c.family?.name ?? null,
    birthday: toDateStr(c.birthday),
    wedding_anniversary: toDateStr(c.weddingAnniversary),
    notes: c.notes,
    photo_url: c.photoUrl,
    created_at: c.createdAt?.toISOString?.() ?? "",
    updated_at: c.updatedAt?.toISOString?.() ?? "",
  }
}

function flattenContactWithTags(c: any): ContactWithTags {
  return {
    ...flattenContact(c),
    tags: (c.tags ?? []).map((ct: any) => {
      const t = ct.tag ?? ct
      return flattenTag(t)
    }),
  }
}

function flattenFamily(f: any): FamilyFlat {
  return {
    id: f.id,
    name: f.name,
    phone: f.phone,
    email: f.email,
    address: f.address,
    congregation_id: f.congregationId,
    congregation_name: f.congregation?.name ?? null,
    notes: f.notes,
    photo_url: f.photoUrl,
    created_at: f.createdAt?.toISOString?.() ?? "",
    updated_at: f.updatedAt?.toISOString?.() ?? "",
  }
}

function flattenFamilyWithTags(f: any): FamilyWithTags {
  return {
    ...flattenFamily(f),
    tags: (f.tags ?? []).map((ft: any) => {
      const t = ft.tag ?? ft
      return flattenTag(t)
    }),
    member_count: f._count?.members ?? f.members?.length ?? 0,
  }
}

function flattenTag(t: any): TagFlat {
  return { id: t.id, name: t.name, color: t.color, created_at: t.createdAt?.toISOString?.() ?? "" }
}

function flattenReminder(r: any): ReminderFlat {
  return {
    id: r.id,
    contact_id: r.contacts?.[0]?.contactId ?? null,
    contact_name: r.contacts?.[0]?.contact
      ? `${r.contacts[0].contact.firstName} ${r.contacts[0].contact.lastName}`
      : undefined,
    contact_ids: r.contacts?.map((rc: any) => rc.contactId),
    contact_names: r.contacts?.map((rc: any) =>
      rc.contact ? `${rc.contact.firstName} ${rc.contact.lastName}` : ""),
    family_ids: r.families?.map((rf: any) => rf.familyId),
    family_names: r.families?.map((rf: any) => rf.family?.name ?? ""),
    type: r.type,
    title: r.title,
    description: r.description,
    due_date: toDateStr(r.dueDate) ?? "",
    repeat: r.repeat,
    completed: r.completed,
    completed_at: r.completedAt?.toISOString?.() ?? null,
    created_at: r.createdAt?.toISOString?.() ?? "",
  }
}

function flattenInteraction(i: any): InteractionFlat {
  return {
    id: i.id,
    contact_id: i.contactId,
    contact_name: i.contact
      ? `${i.contact.firstName} ${i.contact.lastName}`
      : undefined,
    family_id: i.familyId,
    family_name: i.family?.name ?? undefined,
    invite_group_id: i.inviteGroupId ?? null,
    type: i.type,
    notes: i.notes,
    interaction_date: toDateStr(i.interactionDate) ?? "",
    created_at: i.createdAt?.toISOString?.() ?? "",
  }
}

function flattenInviteGroup(g: any): InviteGroupFlat {
  return {
    id: g.id,
    name: g.name,
    family_id: g.familyId,
    family_name: g.family?.name ?? null,
    notes: g.notes,
    created_at: g.createdAt?.toISOString?.() ?? "",
    updated_at: g.updatedAt?.toISOString?.() ?? "",
  }
}

function flattenInviteGroupWithMembers(g: any): InviteGroupWithMembers {
  return {
    ...flattenInviteGroup(g),
    members: (g.members ?? []).map((m: any) => flattenContact(m.contact ?? m)),
  }
}

function flattenEventTemplate(t: any): EventTemplateFlat {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    recurrence_type: t.recurrenceType,
    recurrence_interval: t.recurrenceInterval,
    recurrence_day_of_week: t.recurrenceDayOfWeek,
    recurrence_day_of_month: t.recurrenceDayOfMonth,
    recurrence_week_of_month: t.recurrenceWeekOfMonth,
    time_of_day: toTimeStr(t.timeOfDay),
    max_attendees: t.maxAttendees,
    active: t.active,
    created_at: t.createdAt?.toISOString?.() ?? "",
    updated_at: t.updatedAt?.toISOString?.() ?? "",
  }
}

// ============================================
// Congregations
// ============================================

export async function getCongregations() {
  try {
    const rows = await prisma.congregation.findMany({ orderBy: { name: "asc" } })
    return rows.map(r => ({ id: r.id, name: r.name, city: r.city, created_at: r.createdAt }))
  } catch {
    return []
  }
}

export async function createCongregation(data: { name: string; city?: string }) {
  await prisma.congregation.create({ data: { name: data.name, city: data.city ?? null } })
  revalidatePath("/settings")
}

// ============================================
// Contacts
// ============================================

export async function createContact(data: {
  first_name: string
  last_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  congregation_id?: number | null
  family_id?: number | null
  birthday?: string | null
  wedding_anniversary?: string | null
  notes?: string | null
}) {
  const contact = await prisma.contact.create({
    data: {
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      congregationId: data.congregation_id ?? null,
      familyId: data.family_id ?? null,
      birthday: data.birthday ? new Date(data.birthday) : null,
      weddingAnniversary: data.wedding_anniversary ? new Date(data.wedding_anniversary) : null,
      notes: data.notes ?? null,
    },
  })

  if (data.birthday) {
    await createReminderFromDate(contact.id, data.birthday, "birthday", `Geburtstag: ${data.first_name} ${data.last_name}`)
  }
  if (data.wedding_anniversary) {
    await createReminderFromDate(contact.id, data.wedding_anniversary, "wedding_anniversary", `Hochzeitstag: ${data.first_name} ${data.last_name}`)
  }

  revalidatePath("/contacts")
  revalidatePath("/")
}

async function createReminderFromDate(contactId: number, dateStr: string, type: ReminderType, title: string) {
  const date = new Date(dateStr)
  const today = new Date()
  let nextOccurrence = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  if (nextOccurrence < today) {
    nextOccurrence = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate())
  }

  const reminder = await prisma.reminder.create({
    data: { type, title, dueDate: nextOccurrence, repeat: "yearly" },
  })

  await prisma.reminderContact.create({
    data: { reminderId: reminder.id, contactId },
  })
}

export async function updateContact(
  id: number,
  data: {
    first_name: string
    last_name: string
    phone?: string | null
    email?: string | null
    address?: string | null
    congregation_id?: number | null
    family_id?: number | null
    birthday?: string | null
    wedding_anniversary?: string | null
    notes?: string | null
  },
) {
  await prisma.contact.update({
    where: { id },
    data: {
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      congregationId: data.congregation_id ?? null,
      familyId: data.family_id ?? null,
      birthday: data.birthday ? new Date(data.birthday) : null,
      weddingAnniversary: data.wedding_anniversary ? new Date(data.wedding_anniversary) : null,
      notes: data.notes ?? null,
    },
  })
  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}`)
  revalidatePath("/")
}

export async function deleteContact(id: number) {
  await prisma.contact.delete({ where: { id } })
  revalidatePath("/contacts")
  revalidatePath("/")
}

// ============================================
// Reminders
// ============================================

export async function createReminder(data: {
  contact_id?: number | null
  type: ReminderType
  title: string
  description?: string | null
  due_date: string
  repeat: RepeatInterval
}) {
  const reminder = await prisma.reminder.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      dueDate: new Date(data.due_date),
      repeat: data.repeat,
    },
  })

  if (data.contact_id) {
    await prisma.reminderContact.create({
      data: { reminderId: reminder.id, contactId: data.contact_id },
    })
  }

  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function createReminderWithTargets(data: {
  type: ReminderType
  title: string
  description?: string | null
  due_date: string
  repeat: RepeatInterval
  contact_ids?: number[]
  family_ids?: number[]
}) {
  const reminder = await prisma.reminder.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      dueDate: new Date(data.due_date),
      repeat: data.repeat,
    },
  })

  if (data.contact_ids?.length) {
    await prisma.reminderContact.createMany({
      data: data.contact_ids.map(contactId => ({ reminderId: reminder.id, contactId })),
    })
  }
  if (data.family_ids?.length) {
    await prisma.reminderFamily.createMany({
      data: data.family_ids.map(familyId => ({ reminderId: reminder.id, familyId })),
    })
  }

  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function completeReminder(id: number) {
  const reminder = await prisma.reminder.findUnique({ where: { id } })
  if (!reminder) return

  if (reminder.repeat === "none") {
    await prisma.reminder.update({
      where: { id },
      data: { completed: true, completedAt: new Date() },
    })
  } else {
    const dueDate = new Date(reminder.dueDate)
    let nextDate: Date

    switch (reminder.repeat) {
      case "weekly":
        nextDate = new Date(dueDate.setDate(dueDate.getDate() + 7)); break
      case "monthly":
        nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + 1)); break
      case "quarterly":
        nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + 3)); break
      case "yearly":
        nextDate = new Date(dueDate.setFullYear(dueDate.getFullYear() + 1)); break
      default:
        nextDate = dueDate
    }

    await prisma.reminder.update({
      where: { id },
      data: { dueDate: nextDate },
    })
  }

  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function deleteReminder(id: number) {
  await prisma.reminder.delete({ where: { id } })
  revalidatePath("/reminders")
  revalidatePath("/")
}

// ============================================
// Interactions
// ============================================

export async function createInteraction(data: {
  contact_id?: number | null
  family_id?: number | null
  type: string
  notes?: string | null
  interaction_date: string
}) {
  await prisma.interaction.create({
    data: {
      contactId: data.contact_id ?? null,
      familyId: data.family_id ?? null,
      type: data.type,
      notes: data.notes ?? null,
      interactionDate: new Date(data.interaction_date),
    },
  })
  if (data.contact_id) revalidatePath(`/contacts/${data.contact_id}`)
  if (data.family_id) revalidatePath(`/families/${data.family_id}`)
  revalidatePath("/")
}

export async function getContactInteractions(contactId: number): Promise<InteractionFlat[]> {
  try {
    const rows = await prisma.interaction.findMany({
      where: { contactId },
      orderBy: [{ interactionDate: "desc" }, { createdAt: "desc" }],
    })
    return rows.map(flattenInteraction)
  } catch {
    return []
  }
}

// ============================================
// Tags
// ============================================

export async function getTags(): Promise<TagFlat[]> {
  try {
    const rows = await prisma.tag.findMany({ orderBy: { name: "asc" } })
    return rows.map(flattenTag)
  } catch {
    return []
  }
}

export async function createTag(data: { name: string; color: string }) {
  await prisma.tag.create({ data: { name: data.name, color: data.color } })
  revalidatePath("/settings")
}

export async function deleteTag(tagId: number) {
  await prisma.tag.delete({ where: { id: tagId } })
  revalidatePath("/settings")
  revalidatePath("/contacts")
}

export async function getContactTags(contactId: number): Promise<TagFlat[]> {
  try {
    const rows = await prisma.contactTag.findMany({
      where: { contactId },
      include: { tag: true },
      orderBy: { tag: { name: "asc" } },
    })
    return rows.map(ct => flattenTag(ct.tag))
  } catch {
    return []
  }
}

export async function addTagToContact(contactId: number, tagId: number) {
  await prisma.contactTag.upsert({
    where: { contactId_tagId: { contactId, tagId } },
    update: {},
    create: { contactId, tagId },
  })
  revalidatePath(`/contacts/${contactId}`)
  revalidatePath("/contacts")
}

export async function removeTagFromContact(contactId: number, tagId: number) {
  await prisma.contactTag.delete({ where: { contactId_tagId: { contactId, tagId } } })
  revalidatePath(`/contacts/${contactId}`)
  revalidatePath("/contacts")
}

export async function getContactsWithTags(): Promise<ContactWithTags[]> {
  try {
    const rows = await prisma.contact.findMany({
      include: { congregation: true, family: true, tags: { include: { tag: true } } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    })
    return rows.map(flattenContactWithTags)
  } catch {
    return []
  }
}

// ============================================
// Families
// ============================================

export async function createFamily(data: {
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  congregation_id?: number | null
  notes?: string | null
}) {
  const family = await prisma.family.create({
    data: {
      name: data.name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      congregationId: data.congregation_id ?? null,
      notes: data.notes ?? null,
    },
  })
  revalidatePath("/families")
  revalidatePath("/contacts")
  revalidatePath("/")
  return family.id
}

export async function updateFamily(
  id: number,
  data: {
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
    congregation_id?: number | null
    notes?: string | null
  },
) {
  await prisma.family.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      congregationId: data.congregation_id ?? null,
      notes: data.notes ?? null,
    },
  })
  revalidatePath("/families")
  revalidatePath(`/families/${id}`)
  revalidatePath("/contacts")
  revalidatePath("/")
}

export async function deleteFamily(id: number) {
  await prisma.family.delete({ where: { id } })
  revalidatePath("/families")
  revalidatePath("/contacts")
  revalidatePath("/")
}

export async function getFamilies(): Promise<FamilyFlat[]> {
  try {
    const rows = await prisma.family.findMany({
      include: { congregation: true, _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    })
    return rows.map(flattenFamily)
  } catch {
    return []
  }
}

export async function getFamilyById(id: number) {
  try {
    const f = await prisma.family.findUnique({
      where: { id },
      include: { congregation: true },
    })
    if (!f) return undefined
    return flattenFamily(f)
  } catch {
    return undefined
  }
}

export async function getFamiliesWithTags(): Promise<FamilyWithTags[]> {
  try {
    const rows = await prisma.family.findMany({
      include: {
        congregation: true,
        tags: { include: { tag: true } },
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    })
    return rows.map(flattenFamilyWithTags)
  } catch {
    return []
  }
}

export async function getFamilyMembers(familyId: number): Promise<ContactFlat[]> {
  try {
    const rows = await prisma.contact.findMany({
      where: { familyId },
      include: { congregation: true, family: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    })
    return rows.map(flattenContact)
  } catch {
    return []
  }
}

export async function addContactToFamily(contactId: number, familyId: number) {
  await prisma.contact.update({ where: { id: contactId }, data: { familyId } })
  revalidatePath(`/contacts/${contactId}`)
  revalidatePath(`/families/${familyId}`)
  revalidatePath("/contacts")
  revalidatePath("/families")
}

export async function removeContactFromFamily(contactId: number) {
  await prisma.contact.update({ where: { id: contactId }, data: { familyId: null } })
  revalidatePath(`/contacts/${contactId}`)
  revalidatePath("/contacts")
  revalidatePath("/families")
}

export async function getFamilyTags(familyId: number): Promise<TagFlat[]> {
  try {
    const rows = await prisma.familyTag.findMany({
      where: { familyId },
      include: { tag: true },
      orderBy: { tag: { name: "asc" } },
    })
    return rows.map(ft => flattenTag(ft.tag))
  } catch {
    return []
  }
}

export async function addTagToFamily(familyId: number, tagId: number) {
  await prisma.familyTag.upsert({
    where: { familyId_tagId: { familyId, tagId } },
    update: {},
    create: { familyId, tagId },
  })
  revalidatePath(`/families/${familyId}`)
  revalidatePath("/families")
}

export async function removeTagFromFamily(familyId: number, tagId: number) {
  await prisma.familyTag.delete({ where: { familyId_tagId: { familyId, tagId } } })
  revalidatePath(`/families/${familyId}`)
  revalidatePath("/families")
}

export async function getFamilyInteractions(familyId: number): Promise<InteractionFlat[]> {
  try {
    const rows = await prisma.interaction.findMany({
      where: { familyId },
      orderBy: [{ interactionDate: "desc" }, { createdAt: "desc" }],
    })
    return rows.map(flattenInteraction)
  } catch {
    return []
  }
}

// ============================================
// Unified People View
// ============================================

export async function getPeopleGrouped(): Promise<PeopleGrouped> {
  try {
    const families = await prisma.family.findMany({
      include: {
        congregation: true,
        tags: { include: { tag: true } },
        members: {
          include: { congregation: true, family: true, tags: { include: { tag: true } } },
          orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    })

    const individuals = await prisma.contact.findMany({
      where: { familyId: null },
      include: { congregation: true, family: true, tags: { include: { tag: true } } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    })

    const familiesWithMembers: FamilyWithMembers[] = families.map(f => ({
      ...flattenFamily(f),
      tags: f.tags.map(ft => flattenTag(ft.tag)),
      members: f.members.map(flattenContactWithTags),
    }))

    return {
      families: familiesWithMembers,
      individuals: individuals.map(flattenContactWithTags),
    }
  } catch {
    return { families: [], individuals: [] }
  }
}

// ============================================
// Homepage Dashboard
// ============================================

export type UpcomingBirthday = {
  id: number
  first_name: string
  last_name: string
  birthday: string
  days_until: number
  photo_url: string | null
}

export async function getUpcomingBirthdays(days: number = 14): Promise<UpcomingBirthday[]> {
  try {
    const contacts = await prisma.contact.findMany({
      where: { birthday: { not: null } },
      select: { id: true, firstName: true, lastName: true, birthday: true, photoUrl: true },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const result: UpcomingBirthday[] = []

    for (const c of contacts) {
      if (!c.birthday) continue
      const bday = new Date(c.birthday)
      let nextBirthday = new Date(currentYear, bday.getMonth(), bday.getDate())
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, bday.getMonth(), bday.getDate())
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= days) {
        result.push({
          id: c.id,
          first_name: c.firstName,
          last_name: c.lastName,
          birthday: toDateStr(c.birthday) ?? "",
          days_until: daysUntil,
          photo_url: c.photoUrl,
        })
      }
    }

    result.sort((a, b) => a.days_until - b.days_until)
    return result
  } catch (error) {
    console.error("Error fetching upcoming birthdays:", error)
    return []
  }
}

export type NeglectedContact = {
  id: number
  first_name: string
  last_name: string
  photo_url: string | null
  last_interaction_date: string | null
  days_since_contact: number | null
}

export async function getNeglectedContacts(weeks: number = 4): Promise<NeglectedContact[]> {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        interactions: { orderBy: { interactionDate: "desc" }, take: 1 },
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cutoffDays = weeks * 7
    const result: NeglectedContact[] = []

    for (const c of contacts) {
      const lastInteraction = c.interactions[0]
      let daysSinceContact: number | null = null

      if (lastInteraction) {
        const lastDate = new Date(lastInteraction.interactionDate)
        daysSinceContact = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceContact <= cutoffDays) continue
      }

      result.push({
        id: c.id,
        first_name: c.firstName,
        last_name: c.lastName,
        photo_url: c.photoUrl,
        last_interaction_date: lastInteraction ? toDateStr(lastInteraction.interactionDate) : null,
        days_since_contact: daysSinceContact,
      })
    }

    result.sort((a, b) => {
      if (a.days_since_contact === null && b.days_since_contact === null) return 0
      if (a.days_since_contact === null) return -1
      if (b.days_since_contact === null) return 1
      return b.days_since_contact - a.days_since_contact
    })

    return result.slice(0, 5)
  } catch (error) {
    console.error("Error fetching neglected contacts:", error)
    return []
  }
}

// ============================================
// Export / Import
// ============================================

export async function exportAllData() {
  try {
    const [contacts, reminders, congregations, tags, interactions] = await Promise.all([
      prisma.contact.findMany({ orderBy: { id: "asc" } }),
      prisma.reminder.findMany({ orderBy: { id: "asc" } }),
      prisma.congregation.findMany({ orderBy: { id: "asc" } }),
      prisma.tag.findMany({ orderBy: { id: "asc" } }),
      prisma.interaction.findMany({ orderBy: { id: "asc" } }),
    ])
    return { contacts, reminders, congregations, tags, interactions, exportedAt: new Date().toISOString(), version: "1.0" }
  } catch (error) {
    console.error("Export failed:", error)
    return null
  }
}

// ============================================
// Event Templates & Slots
// ============================================


export async function getEventCategories(): Promise<{ value: string; label: string }[]> {
  const templates = await prisma.eventTemplate.findMany({
    where: { active: true, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  })

  const customCategories = templates
    .map((t) => t.category!)
    .filter((c) => !DEFAULT_EVENT_CATEGORIES.some((d) => d.value === c))
    .map((c) => ({ value: c, label: c }))

  return [...DEFAULT_EVENT_CATEGORIES, ...customCategories]
}

export async function getEventTemplates(): Promise<EventTemplateFlat[]> {
  try {
    const rows = await prisma.eventTemplate.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    })
    return rows.map(flattenEventTemplate)
  } catch {
    return []
  }
}

export async function getEventTemplate(id: number): Promise<EventTemplateFlat | null> {
  try {
    const t = await prisma.eventTemplate.findUnique({ where: { id } })
    return t ? flattenEventTemplate(t) : null
  } catch {
    return null
  }
}

export async function createEventTemplate(data: {
  category: string
  description?: string | null
  recurrence_type: string
  recurrence_interval?: number
  recurrence_day_of_week?: number | null
  recurrence_day_of_month?: number | null
  recurrence_week_of_month?: number | null
  time_of_day?: string | null
  max_attendees?: number
}) {
  const template = await prisma.eventTemplate.create({
    data: {
      name: getCategoryLabel(data.category),
      category: data.category,
      recurrenceType: data.recurrence_type,
      recurrenceInterval: data.recurrence_interval ?? 1,
      recurrenceDayOfWeek: data.recurrence_day_of_week ?? null,
      recurrenceDayOfMonth: data.recurrence_day_of_month ?? null,
      recurrenceWeekOfMonth: data.recurrence_week_of_month ?? null,
      timeOfDay: data.time_of_day ? new Date(`1970-01-01T${data.time_of_day}`) : null,
      maxAttendees: data.max_attendees ?? 1,
    },
  })

  await generateEventSlots(template.id, 3)
  revalidatePath("/events")
  revalidatePath("/")
  return template.id
}

export async function updateEventTemplate(
  id: number,
  data: {
    category: string
    description?: string | null
    recurrence_type: string
    recurrence_interval?: number
    recurrence_day_of_week?: number | null
    recurrence_day_of_month?: number | null
    recurrence_week_of_month?: number | null
    time_of_day?: string | null
    max_attendees?: number
    active?: boolean
  },
) {
  await prisma.eventTemplate.update({
    where: { id },
    data: {
      name: getCategoryLabel(data.category),
      category: data.category,
      recurrenceType: data.recurrence_type,
      recurrenceInterval: data.recurrence_interval ?? 1,
      recurrenceDayOfWeek: data.recurrence_day_of_week ?? null,
      recurrenceDayOfMonth: data.recurrence_day_of_month ?? null,
      recurrenceWeekOfMonth: data.recurrence_week_of_month ?? null,
      timeOfDay: data.time_of_day ? new Date(`1970-01-01T${data.time_of_day}`) : null,
      maxAttendees: data.max_attendees ?? 1,
      active: data.active ?? true,
    },
  })
  revalidatePath("/events")
  revalidatePath("/")
}

export async function deleteEventTemplate(id: number) {
  await prisma.eventTemplate.delete({ where: { id } })
  revalidatePath("/events")
  revalidatePath("/events/templates")
  revalidatePath("/")
}

export async function generateEventSlots(templateId: number, months: number = 3): Promise<number> {
  const template = await prisma.eventTemplate.findUnique({ where: { id: templateId } })
  if (!template) return 0

  const today = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + months)

  const slots: { date: Date; time: Date | null }[] = []

  if (template.recurrenceType === "weekly") {
    const currentDate = new Date(today)
    const targetDayOfWeek = template.recurrenceDayOfWeek ?? 0
    while (currentDate.getDay() !== targetDayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    while (currentDate <= endDate) {
      slots.push({ date: new Date(currentDate), time: template.timeOfDay })
      currentDate.setDate(currentDate.getDate() + 7 * (template.recurrenceInterval || 1))
    }
  } else if (template.recurrenceType === "monthly") {
    // Check if using nth-weekday-of-month pattern
    if (template.recurrenceWeekOfMonth !== null && template.recurrenceDayOfWeek !== null) {
      // Nth weekday of month (e.g., "2nd Friday")
      const currentDate = new Date(today.getFullYear(), today.getMonth(), 1)
      while (currentDate <= endDate) {
        const nthWeekdayDate = getNthWeekdayOfMonth(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          template.recurrenceDayOfWeek,
          template.recurrenceWeekOfMonth
        )
        if (nthWeekdayDate && nthWeekdayDate >= today && nthWeekdayDate <= endDate) {
          slots.push({ date: nthWeekdayDate, time: template.timeOfDay })
        }
        currentDate.setMonth(currentDate.getMonth() + (template.recurrenceInterval || 1))
      }
    } else {
      // Fixed day of month
      const targetDay = template.recurrenceDayOfMonth || 1
      const currentDate = new Date(today.getFullYear(), today.getMonth(), targetDay)
      if (currentDate < today) currentDate.setMonth(currentDate.getMonth() + 1)
      while (currentDate <= endDate) {
        slots.push({ date: new Date(currentDate), time: template.timeOfDay })
        currentDate.setMonth(currentDate.getMonth() + (template.recurrenceInterval || 1))
      }
    }
  }

  let createdCount = 0
  for (const slot of slots) {
    try {
      await prisma.eventSlot.create({
        data: {
          eventTemplateId: templateId,
          slotDate: slot.date,
          slotTime: slot.time,
          status: "available",
        },
      })
      createdCount++
    } catch {
      // unique constraint violation — slot already exists
    }
  }

  revalidatePath("/events")
  return createdCount
}

export async function getUpcomingSlots(limit: number = 20): Promise<EventSlotWithDetails[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const slots = await prisma.eventSlot.findMany({
      where: { slotDate: { gte: today }, template: { active: true } },
      include: {
        template: true,
        contacts: { include: { contact: true, family: true } },
      },
      orderBy: [{ slotDate: "asc" }, { slotTime: "asc" }],
      take: limit,
    })

    return slots.map(slot => {
      const contactList = slot.contacts.map(esc => flattenContact(esc.contact))
      const familyList = slot.contacts
        .filter(esc => esc.family)
        .map(esc => flattenFamily(esc.family!))
        .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)

      return {
        id: slot.id,
        event_template_id: slot.eventTemplateId,
        event_template_name: slot.template.name,
        event_template_category: slot.template.category ?? undefined,
        slot_date: toDateStr(slot.slotDate) ?? "",
        slot_time: toTimeStr(slot.slotTime),
        status: slot.status,
        notes: slot.notes,
        created_at: slot.createdAt.toISOString(),
        updated_at: slot.updatedAt.toISOString(),
        template: flattenEventTemplate(slot.template),
        contacts: contactList,
        families: familyList,
        attendee_count: slot.contacts.length,
        available_spots: slot.template.maxAttendees - slot.contacts.length,
        max_attendees: slot.template.maxAttendees,
      } as unknown as EventSlotWithDetails
    })
  } catch {
    return []
  }
}

export async function assignContactToSlot(slotId: number, contactIds: number[], familyIds?: number[]) {
  // Remove existing assignments
  await prisma.eventSlotContact.deleteMany({ where: { eventSlotId: slotId } })

  // Add contact assignments
  for (const contactId of contactIds) {
    await prisma.eventSlotContact.create({
      data: { eventSlotId: slotId, contactId, familyId: null, response: "pending" },
    })
  }

  // Add family assignments
  if (familyIds?.length) {
    for (const familyId of familyIds) {
      const firstMember = await prisma.contact.findFirst({ where: { familyId } })
      if (firstMember) {
        await prisma.eventSlotContact.create({
          data: { eventSlotId: slotId, contactId: firstMember.id, familyId, response: "pending" },
        })
      }
    }
  }

  if (contactIds.length > 0 || (familyIds && familyIds.length > 0)) {
    await prisma.eventSlot.update({ where: { id: slotId }, data: { status: "assigned" } })
  }

  revalidatePath("/events")
  revalidatePath("/")
}

export async function updateSlotStatus(slotId: number, status: "available" | "assigned" | "completed" | "cancelled") {
  await prisma.eventSlot.update({ where: { id: slotId }, data: { status } })
  revalidatePath("/events")
}

export async function removeContactFromSlot(slotId: number, contactId: number) {
  await prisma.eventSlotContact.delete({
    where: { eventSlotId_contactId: { eventSlotId: slotId, contactId } },
  })

  const remaining = await prisma.eventSlotContact.count({ where: { eventSlotId: slotId } })
  if (remaining === 0) {
    await prisma.eventSlot.update({ where: { id: slotId }, data: { status: "available" } })
  }

  revalidatePath("/events")
}

export async function updateTag(tagId: number, data: { name: string; color: string }) {
  await prisma.tag.update({ where: { id: tagId }, data: { name: data.name, color: data.color } })
  revalidatePath("/settings")
  revalidatePath("/contacts")
}

// ============================================
// Homepage queries
// ============================================

export async function getOverdueReminders(limit: number = 5): Promise<ReminderFlat[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reminders = await prisma.reminder.findMany({
    where: { completed: false, dueDate: { lt: today } },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
  })
  return reminders.map(flattenReminder)
}

export async function getUpcomingReminders(limit: number = 5): Promise<ReminderFlat[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const reminders = await prisma.reminder.findMany({
    where: { completed: false, dueDate: { gte: today, lte: nextWeek } },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
  })
  return reminders.map(flattenReminder)
}

export async function getStats() {
  const [contacts, reminders, overdue] = await Promise.all([
    prisma.contact.count(),
    prisma.reminder.count({ where: { completed: false } }),
    prisma.reminder.count({
      where: { completed: false, dueDate: { lt: new Date() } },
    }),
  ])
  return { contacts, reminders, overdue }
}

// ============================================
// Calendar
// ============================================

export async function getRemindersForMonth(year: number, month: number): Promise<ReminderFlat[]> {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  const reminders = await prisma.reminder.findMany({
    where: { dueDate: { gte: startDate, lte: endDate } },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: { dueDate: "asc" },
  })
  return reminders.map(flattenReminder)
}

// ============================================
// Contact detail queries
// ============================================

export async function getContactById(id: number): Promise<ContactFlat | null> {
  const c = await prisma.contact.findUnique({
    where: { id },
    include: { congregation: true, family: true },
  })
  if (!c) return null
  return flattenContact(c)
}

export async function getContactReminders(contactId: number): Promise<ReminderFlat[]> {
  const reminders = await prisma.reminder.findMany({
    where: {
      completed: false,
      contacts: { some: { contactId } },
    },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: { dueDate: "asc" },
  })
  return reminders.map(flattenReminder)
}

// ============================================
// Family detail queries
// ============================================

export async function getFamilyReminders(familyId: number): Promise<ReminderFlat[]> {
  const reminders = await prisma.reminder.findMany({
    where: {
      families: { some: { familyId } },
    },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })
  return reminders.map(flattenReminder)
}

// ============================================
// Reminders list
// ============================================

export async function getOpenReminders(): Promise<ReminderFlat[]> {
  const reminders = await prisma.reminder.findMany({
    where: { completed: false },
    include: {
      contacts: { include: { contact: true } },
      families: { include: { family: true } },
    },
    orderBy: { dueDate: "asc" },
  })
  return reminders.map(flattenReminder)
}

// ============================================
// Invite Groups
// ============================================

export async function createInviteGroup(data: {
  name: string
  family_id?: number | null
  contact_ids: number[]
  notes?: string | null
}) {
  const group = await prisma.inviteGroup.create({
    data: {
      name: data.name,
      familyId: data.family_id ?? null,
      notes: data.notes ?? null,
    },
  })

  if (data.contact_ids.length > 0) {
    await prisma.inviteGroupMember.createMany({
      data: data.contact_ids.map(contactId => ({
        inviteGroupId: group.id,
        contactId,
      })),
    })
  }

  revalidatePath("/invite-groups")
  revalidatePath("/")
  return group.id
}

export async function updateInviteGroup(id: number, data: {
  name: string
  contact_ids: number[]
  notes?: string | null
}) {
  await prisma.inviteGroup.update({
    where: { id },
    data: { name: data.name, notes: data.notes ?? null },
  })

  // Replace members
  await prisma.inviteGroupMember.deleteMany({ where: { inviteGroupId: id } })
  if (data.contact_ids.length > 0) {
    await prisma.inviteGroupMember.createMany({
      data: data.contact_ids.map(contactId => ({
        inviteGroupId: id,
        contactId,
      })),
    })
  }

  revalidatePath("/invite-groups")
  revalidatePath("/")
}

export async function deleteInviteGroup(id: number) {
  await prisma.inviteGroup.delete({ where: { id } })
  revalidatePath("/invite-groups")
  revalidatePath("/")
}

export async function getInviteGroups(): Promise<InviteGroupWithMembers[]> {
  const groups = await prisma.inviteGroup.findMany({
    include: {
      family: true,
      members: { include: { contact: { include: { congregation: true, family: true } } } },
    },
    orderBy: { name: "asc" },
  })
  return groups.map(flattenInviteGroupWithMembers)
}

export async function getInviteGroupById(id: number): Promise<InviteGroupWithMembers | null> {
  const group = await prisma.inviteGroup.findUnique({
    where: { id },
    include: {
      family: true,
      members: { include: { contact: { include: { congregation: true, family: true } } } },
    },
  })
  if (!group) return null
  return flattenInviteGroupWithMembers(group)
}

export async function getInviteGroupsByFamily(familyId: number): Promise<InviteGroupWithMembers[]> {
  const groups = await prisma.inviteGroup.findMany({
    where: { familyId },
    include: {
      family: true,
      members: { include: { contact: { include: { congregation: true, family: true } } } },
    },
    orderBy: { name: "asc" },
  })
  return groups.map(flattenInviteGroupWithMembers)
}

// ============================================
// Bulk Interaction (Quick Activity Logging)
// ============================================

export async function createBulkInteraction(data: {
  invite_group_ids: number[]
  type: string
  notes?: string | null
  interaction_date: string
}) {
  const rows = data.invite_group_ids.map(inviteGroupId => ({
    inviteGroupId,
    contactId: null as number | null,
    familyId: null as number | null,
    type: data.type,
    notes: data.notes ?? null,
    interactionDate: new Date(data.interaction_date),
  }))

  if (rows.length > 0) {
    await prisma.interaction.createMany({ data: rows })
  }

  revalidatePath("/")
  revalidatePath("/invite-groups")
}

export async function getInteractionTypes(): Promise<string[]> {
  const defaults = ["call", "visit", "message", "badminton", "treffen"]
  const rows = await prisma.interaction.findMany({
    select: { type: true },
    distinct: ["type"],
  })
  const dbTypes = rows.map(r => r.type)
  const all = [...new Set([...defaults, ...dbTypes])]
  return all.sort()
}

// ============================================
// Relationship Score
// ============================================

function computeScore(interactions: { interactionDate: Date; type: string }[]): ScoreResult {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const recent = interactions.filter(i => i.interactionDate >= ninetyDaysAgo)

  // Recency (0-100)
  let recency = 0
  if (interactions.length > 0) {
    const sorted = [...interactions].sort((a, b) => b.interactionDate.getTime() - a.interactionDate.getTime())
    const lastDate = sorted[0].interactionDate
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince <= 0) recency = 100
    else if (daysSince <= 7) recency = 100 - (daysSince / 7) * 20
    else if (daysSince <= 14) recency = 80 - ((daysSince - 7) / 7) * 20
    else if (daysSince <= 30) recency = 60 - ((daysSince - 14) / 16) * 20
    else if (daysSince <= 60) recency = 40 - ((daysSince - 30) / 30) * 20
    else if (daysSince <= 90) recency = 20 - ((daysSince - 60) / 30) * 20
    else recency = 0
  }

  // Frequency (0-100)
  const count = recent.length
  let frequency = 0
  if (count >= 8) frequency = 100
  else if (count >= 5) frequency = 80
  else if (count >= 3) frequency = 60
  else if (count >= 2) frequency = 40
  else if (count >= 1) frequency = 20

  // Variety (0-100)
  const types = new Set(recent.map(i => i.type))
  let variety = 0
  if (types.size >= 3) variety = 100
  else if (types.size === 2) variety = 60
  else if (types.size === 1) variety = 30

  const score = Math.round(recency * 0.5 + frequency * 0.3 + variety * 0.2)

  let label: string
  let color: string
  if (score >= 75) { label = "Stark"; color = "text-green-600" }
  else if (score >= 50) { label = "Gut"; color = "text-blue-600" }
  else if (score >= 25) { label = "Schwach"; color = "text-yellow-600" }
  else if (score > 0) { label = "Kritisch"; color = "text-red-600" }
  else { label = "Keine Daten"; color = "text-muted-foreground" }

  return {
    score,
    label,
    color,
    recency: Math.round(recency),
    frequency: Math.round(frequency),
    variety: Math.round(variety),
  }
}

export async function getInviteGroupScore(groupId: number): Promise<ScoreResult> {
  // Direct invite group interactions
  const groupInteractions = await prisma.interaction.findMany({
    where: { inviteGroupId: groupId },
    select: { interactionDate: true, type: true },
  })

  if (groupInteractions.length > 0) {
    return computeScore(groupInteractions)
  }

  // Fallback: check member contacts and family interactions
  const group = await prisma.inviteGroup.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { contactId: true } },
    },
  })
  if (!group) return computeScore([])

  const memberIds = group.members.map(m => m.contactId)
  const fallbackInteractions = await prisma.interaction.findMany({
    where: {
      OR: [
        { contactId: { in: memberIds } },
        ...(group.familyId ? [{ familyId: group.familyId }] : []),
      ],
    },
    select: { interactionDate: true, type: true },
  })

  if (fallbackInteractions.length === 0) return computeScore([])

  // Dampen fallback score by 50%
  const raw = computeScore(fallbackInteractions)
  const dampened = Math.round(raw.score * 0.5)
  let label: string
  let color: string
  if (dampened >= 75) { label = "Stark"; color = "text-green-600" }
  else if (dampened >= 50) { label = "Gut"; color = "text-blue-600" }
  else if (dampened >= 25) { label = "Schwach"; color = "text-yellow-600" }
  else if (dampened > 0) { label = "Kritisch"; color = "text-red-600" }
  else { label = "Keine Daten"; color = "text-muted-foreground" }

  return { ...raw, score: dampened, label, color }
}

export async function getInviteGroupsWithScores(): Promise<InviteGroupWithScore[]> {
  const groups = await prisma.inviteGroup.findMany({
    include: {
      family: true,
      members: { include: { contact: { include: { congregation: true, family: true } } } },
      interactions: { select: { interactionDate: true, type: true } },
    },
    orderBy: { name: "asc" },
  })

  const results: InviteGroupWithScore[] = []

  for (const g of groups) {
    let score: ScoreResult

    if (g.interactions.length > 0) {
      score = computeScore(g.interactions)
    } else {
      // Fallback: member + family interactions
      const memberIds = g.members.map(m => m.contactId)
      const fallbackInteractions = await prisma.interaction.findMany({
        where: {
          OR: [
            ...(memberIds.length > 0 ? [{ contactId: { in: memberIds } }] : []),
            ...(g.familyId ? [{ familyId: g.familyId }] : []),
          ],
        },
        select: { interactionDate: true, type: true },
      })

      if (fallbackInteractions.length > 0) {
        const raw = computeScore(fallbackInteractions)
        const dampened = Math.round(raw.score * 0.5)
        let label: string
        let color: string
        if (dampened >= 75) { label = "Stark"; color = "text-green-600" }
        else if (dampened >= 50) { label = "Gut"; color = "text-blue-600" }
        else if (dampened >= 25) { label = "Schwach"; color = "text-yellow-600" }
        else if (dampened > 0) { label = "Kritisch"; color = "text-red-600" }
        else { label = "Keine Daten"; color = "text-muted-foreground" }
        score = { ...raw, score: dampened, label, color }
      } else {
        score = computeScore([])
      }
    }

    results.push({
      ...flattenInviteGroupWithMembers(g),
      score,
    })
  }

  return results
}

export async function getContactScore(contactId: number): Promise<ScoreResult> {
  const interactions = await prisma.interaction.findMany({
    where: { contactId },
    select: { interactionDate: true, type: true },
  })
  return computeScore(interactions)
}

// ============================================
// Event Slot Invite Groups
// ============================================

export async function assignInviteGroupsToSlot(slotId: number, inviteGroupIds: number[]) {
  await prisma.eventSlotInviteGroup.deleteMany({ where: { eventSlotId: slotId } })

  for (const inviteGroupId of inviteGroupIds) {
    await prisma.eventSlotInviteGroup.create({
      data: { eventSlotId: slotId, inviteGroupId, response: "pending" },
    })
  }

  if (inviteGroupIds.length > 0) {
    await prisma.eventSlot.update({ where: { id: slotId }, data: { status: "assigned" } })
  }

  revalidatePath("/events")
  revalidatePath("/")
}

// ============================================
// Data Migration: Create default invite groups
// ============================================

export async function migrateToInviteGroups() {
  // Create invite groups for families that don't have one yet
  const families = await prisma.family.findMany({
    include: {
      members: true,
      inviteGroups: true,
    },
  })

  for (const family of families) {
    if (family.inviteGroups.length === 0 && family.members.length > 0) {
      const group = await prisma.inviteGroup.create({
        data: {
          name: family.name,
          familyId: family.id,
        },
      })
      await prisma.inviteGroupMember.createMany({
        data: family.members.map(m => ({
          inviteGroupId: group.id,
          contactId: m.id,
        })),
      })
    }
  }

  // Create invite groups for contacts without a family
  const contactsWithoutFamily = await prisma.contact.findMany({
    where: { familyId: null },
    include: { inviteGroupMemberships: true },
  })

  for (const contact of contactsWithoutFamily) {
    if (contact.inviteGroupMemberships.length === 0) {
      const group = await prisma.inviteGroup.create({
        data: {
          name: `${contact.firstName} ${contact.lastName}`,
          familyId: null,
        },
      })
      await prisma.inviteGroupMember.create({
        data: { inviteGroupId: group.id, contactId: contact.id },
      })
    }
  }

  revalidatePath("/invite-groups")
  revalidatePath("/")
}
