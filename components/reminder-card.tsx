"use client"

import { Phone, Heart, Gift, Users, Calendar, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Reminder } from "@/lib/db"

const typeConfig = {
  birthday: { icon: Gift, color: "bg-chart-3/15 text-chart-3", label: "Geburtstag" },
  anniversary: { icon: Heart, color: "bg-destructive/15 text-destructive", label: "Hochzeitstag" },
  call: { icon: Phone, color: "bg-accent/15 text-accent", label: "Anrufen" },
  invite: { icon: Users, color: "bg-chart-4/15 text-chart-4", label: "Einladen" },
  visit: { icon: Users, color: "bg-chart-5/15 text-chart-5", label: "Besuchen" },
  custom: { icon: Calendar, color: "bg-muted text-muted-foreground", label: "Termin" },
}

interface ReminderCardProps {
  reminder: Reminder & {
    contacts?: Array<{ id: number; name: string }>
    families?: Array<{ id: number; name: string }>
  }
  onComplete?: (id: number) => void
}

export function ReminderCard({ reminder, onComplete }: ReminderCardProps) {
  const config = typeConfig[reminder.type] || typeConfig.custom
  const Icon = config.icon

  const dueDate = new Date(reminder.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getDueDateText = () => {
    if (diffDays < 0) return `${Math.abs(diffDays)} Tage überfällig`
    if (diffDays === 0) return "Heute"
    if (diffDays === 1) return "Morgen"
    if (diffDays <= 7) return `In ${diffDays} Tagen`
    return dueDate.toLocaleDateString("de-DE", { day: "numeric", month: "short" })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm",
        reminder.completed && "opacity-60",
        diffDays < 0 && "border-destructive/30 bg-destructive/5",
      )}
    >
      <div className={cn("p-2.5 rounded-xl", config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-card-foreground truncate", reminder.completed && "line-through")}>
          {reminder.title}
        </p>
        {(reminder.contacts?.length > 0 || reminder.families?.length > 0) && (
          <p className="text-sm text-muted-foreground truncate">
            {reminder.families?.map(f => f.name).join(", ")}
            {reminder.families?.length > 0 && reminder.contacts?.length > 0 && ", "}
            {reminder.contacts?.map(c => c.name).join(", ")}
          </p>
        )}
        <p
          className={cn(
            "text-xs mt-0.5 font-medium",
            diffDays < 0 ? "text-destructive" : diffDays === 0 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {getDueDateText()}
        </p>
      </div>
      {!reminder.completed && onComplete && (
        <button
          onClick={() => onComplete(reminder.id)}
          className="p-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          aria-label="Erinnerung abschließen"
        >
          <Check className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
