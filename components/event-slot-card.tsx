"use client"

import { CalendarClock, Users, MapPin, Check, UserPlus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EventSlotWithDetails } from "@/lib/db"
import { useState } from "react"

const categoryConfig = {
  "jw-broadcasting": { color: "bg-chart-1/15 text-chart-1", label: "JW Broadcasting" },
  "field-service": { color: "bg-chart-2/15 text-chart-2", label: "Predigtdienst" },
  "group-meeting": { color: "bg-chart-3/15 text-chart-3", label: "Gruppentreffpunkt" },
  "bible-study": { color: "bg-chart-4/15 text-chart-4", label: "Bibelstudium" },
  "custom": { color: "bg-muted text-muted-foreground", label: "Event" },
}

interface EventSlotCardProps {
  slot: EventSlotWithDetails
  onInvite?: (slotId: number) => void
  onComplete?: (slotId: number) => void
  onCancel?: (slotId: number) => void
  showActions?: boolean
}

export function EventSlotCard({ slot, onInvite, onComplete, onCancel, showActions = true }: EventSlotCardProps) {
  const [loading, setLoading] = useState(false)
  const category = slot.event_template_category || "custom"
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.custom

  const slotDate = new Date(slot.slot_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((slotDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getDateText = () => {
    if (diffDays < 0) return slotDate.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })
    if (diffDays === 0) return "Heute"
    if (diffDays === 1) return "Morgen"
    if (diffDays <= 7) return `In ${diffDays} Tagen`
    return slotDate.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })
  }

  const getStatusBadge = () => {
    switch (slot.status) {
      case "available":
        return <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">Verfügbar</Badge>
      case "assigned":
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Zugewiesen</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Abgeschlossen</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Abgesagt</Badge>
    }
  }

  const handleInvite = async () => {
    if (!onInvite) return
    setLoading(true)
    try {
      await onInvite(slot.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm overflow-hidden",
        slot.status === "completed" && "opacity-60",
        slot.status === "cancelled" && "opacity-50 border-destructive/20",
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className={cn("p-2 rounded-xl", config.color)}>
              <CalendarClock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-card-foreground truncate">
                {slot.event_template_name}
              </p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={cn(
              "font-medium",
              diffDays === 0 ? "text-primary" : diffDays < 0 ? "text-muted-foreground" : "text-foreground"
            )}>
              {getDateText()}
            </span>
          </div>
          {slot.slot_time && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>•</span>
              <span>{slot.slot_time.slice(0, 5)} Uhr</span>
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 mt-2 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {slot.attendee_count || 0} / {slot.template?.max_attendees || 1} 
            {slot.available_spots && slot.available_spots > 0 && (
              <span className="text-chart-3 ml-1">
                ({slot.available_spots} {slot.available_spots === 1 ? "Platz" : "Plätze"} frei)
              </span>
            )}
          </span>
        </div>

        {/* Assigned Contacts/Families */}
        {(slot.contacts && slot.contacts.length > 0) || (slot.families && slot.families.length > 0) ? (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Eingeladen:</p>
            <div className="flex flex-wrap gap-1.5">
              {slot.families?.map((family) => (
                <Badge key={`family-${family.id}`} variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {family.name}
                </Badge>
              ))}
              {slot.contacts?.map((contact) => (
                <Badge key={`contact-${contact.id}`} variant="secondary" className="text-xs">
                  {contact.first_name} {contact.last_name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {slot.notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">{slot.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && slot.status !== "completed" && slot.status !== "cancelled" && (
        <div className="px-4 pb-4 flex gap-2">
          {slot.status === "available" && onInvite && (
            <Button
              onClick={handleInvite}
              disabled={loading}
              className="flex-1 rounded-xl"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Einladen
            </Button>
          )}
          
          {slot.status === "assigned" && (
            <>
              {onComplete && (
                <Button
                  onClick={() => onComplete(slot.id)}
                  variant="default"
                  className="flex-1 rounded-xl"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Abschließen
                </Button>
              )}
              {onInvite && (
                <Button
                  onClick={handleInvite}
                  variant="outline"
                  className="rounded-xl"
                  size="sm"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
