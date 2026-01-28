"use client"

import { useState } from "react"
import { ReminderCard } from "./reminder-card"
import { completeReminder } from "@/app/actions"
import type { Reminder } from "@/lib/db"

interface ReminderListProps {
  initialReminders: Reminder[]
}

export function ReminderList({ initialReminders }: ReminderListProps) {
  const [reminders, setReminders] = useState(initialReminders)

  async function handleComplete(id: number) {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    await completeReminder(id)
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <ReminderCard key={reminder.id} reminder={reminder} onComplete={handleComplete} />
      ))}
    </div>
  )
}
