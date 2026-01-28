import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ReminderForm } from "@/components/reminder-form"

export const dynamic = 'force-dynamic'

export default async function NewReminderPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Neue Erinnerung" showBack />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <ReminderForm />
      </div>
      <BottomNav />
    </div>
  )
}
