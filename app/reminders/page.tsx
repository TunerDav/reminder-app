import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Bell, Plus } from "lucide-react"
import Link from "next/link"
import { ReminderList } from "@/components/reminder-list"
import { getOpenReminders } from "@/app/actions"

export default async function RemindersPage() {
  const reminders = await getOpenReminders()

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Erinnerungen" />

      <div className="px-4 py-2 max-w-lg mx-auto">
        {reminders.length > 0 ? (
          <ReminderList initialReminders={reminders} />
        ) : (
          <EmptyState
            icon={<Bell className="h-6 w-6 text-muted-foreground" />}
            title="Keine Erinnerungen"
            description="Erstelle Erinnerungen um nichts Wichtiges zu vergessen"
            action={
              <Link
                href="/reminders/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Erinnerung erstellen
              </Link>
            }
          />
        )}
      </div>

      {/* Floating Action Button */}
      {reminders.length > 0 && (
        <Link
          href="/reminders/new"
          className="fixed right-4 bottom-20 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200"
          aria-label="Neue Erinnerung erstellen"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}

      <BottomNav />
    </div>
  )
}
