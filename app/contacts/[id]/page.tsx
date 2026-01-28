import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ContactDetail } from "@/components/contact-detail"
import { getContactById, getContactTags, getContactReminders, getContactInteractions, getContactScore } from "@/app/actions"

export const dynamic = 'force-dynamic'

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contactId = parseInt(id)
  const [contact, tags, reminders, interactions, score] = await Promise.all([
    getContactById(contactId),
    getContactTags(contactId),
    getContactReminders(contactId),
    getContactInteractions(contactId),
    getContactScore(contactId),
  ])

  if (!contact) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kontakt" showBack />
      <ContactDetail contact={contact} tags={tags} reminders={reminders} interactions={interactions} score={score} />
      <BottomNav />
    </div>
  )
}
