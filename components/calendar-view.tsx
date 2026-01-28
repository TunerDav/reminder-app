"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReminderCard } from "./reminder-card"
import { cn } from "@/lib/utils"
import type { Reminder } from "@/lib/db"

interface CalendarViewProps {
  initialReminders: Reminder[]
}

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]

export function CalendarView({ initialReminders }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [reminders] = useState(initialReminders)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getRemindersForDate = (date: Date) => {
    return reminders.filter((r) => {
      const reminderDate = new Date(r.due_date)
      return (
        reminderDate.getDate() === date.getDate() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const days: (number | null)[] = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const selectedReminders = selectedDate ? getRemindersForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Vorheriger Monat</span>
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          {monthNames[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl">
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Nächster Monat</span>
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const date = new Date(year, month, day)
            const dayReminders = getRemindersForDate(date)
            const hasReminders = dayReminders.length > 0
            const hasOverdue = dayReminders.some((r) => !r.completed && new Date(r.due_date) < today)
            const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === month &&
              selectedDate?.getFullYear() === year

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200 relative",
                  isToday(day) && "bg-primary text-primary-foreground font-bold shadow-sm",
                  isSelected && !isToday(day) && "bg-primary/15 text-primary font-medium",
                  !isToday(day) && !isSelected && "hover:bg-muted text-foreground",
                )}
              >
                {day}
                {hasReminders && (
                  <span
                    className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      isToday(day) ? "bg-primary-foreground" : hasOverdue ? "bg-destructive" : "bg-primary",
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Reminders */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">
            {selectedDate.toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {selectedReminders.length > 0 ? (
            selectedReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Keine Erinnerungen für diesen Tag</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
