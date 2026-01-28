import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { CalendarView } from "@/components/calendar-view"
import { getRemindersForMonth } from "@/app/actions"

export default async function CalendarPage() {
  const today = new Date()
  const reminders = await getRemindersForMonth(today.getFullYear(), today.getMonth())

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kalender" />
      <div className="px-4 py-2 max-w-lg mx-auto">
        <CalendarView initialReminders={reminders} />
      </div>
      <BottomNav />
    </div>
  )
}
