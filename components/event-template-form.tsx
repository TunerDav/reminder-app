"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEventTemplate, updateEventTemplate } from "@/app/actions"
import { CalendarClock, RotateCcw, Clock, Users, Tag, Plus } from "lucide-react"
import type { EventTemplate, RecurrenceType } from "@/lib/db"

const recurrenceTypes: { value: RecurrenceType; label: string }[] = [
  { value: "weekly", label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
]

const daysOfWeek = [
  { value: 0, label: "Sonntag" },
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
]

const NEW_CATEGORY_VALUE = "__new__"

type EventTemplateFormProps = {
  template?: EventTemplate
  categories: { value: string; label: string }[]
  onSuccess?: () => void
}

export function EventTemplateForm({ template, categories, onSuccess }: EventTemplateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(template?.recurrence_type || "monthly")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(template?.category || "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const category = isCustomCategory
      ? (formData.get("custom_category") as string).trim()
      : selectedCategory

    if (!category) return setLoading(false)

    const data = {
      category,
      description: (formData.get("description") as string) || null,
      recurrence_type: formData.get("recurrence_type") as RecurrenceType,
      recurrence_interval: parseInt(formData.get("recurrence_interval") as string) || 1,
      recurrence_day_of_week: formData.get("recurrence_day_of_week")
        ? parseInt(formData.get("recurrence_day_of_week") as string)
        : null,
      recurrence_day_of_month: formData.get("recurrence_day_of_month")
        ? parseInt(formData.get("recurrence_day_of_month") as string)
        : null,
      time_of_day: (formData.get("time_of_day") as string) || null,
      max_attendees: parseInt(formData.get("max_attendees") as string) || 1,
    }

    try {
      if (template) {
        await updateEventTemplate(template.id, data)
      } else {
        await createEventTemplate(data)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/events")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving event template:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryChange(value: string) {
    if (value === NEW_CATEGORY_VALUE) {
      setIsCustomCategory(true)
      setSelectedCategory("")
    } else {
      setIsCustomCategory(false)
      setSelectedCategory(value)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium">Kategorie</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-muted-foreground text-xs">
              Kategorie *
            </Label>
            <Select
              defaultValue={template?.category || ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CATEGORY_VALUE}>
                  <span className="flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Neue Kategorie
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomCategory && (
            <div className="space-y-1.5">
              <Label htmlFor="custom_category" className="text-muted-foreground text-xs">
                Name der neuen Kategorie *
              </Label>
              <Input
                id="custom_category"
                name="custom_category"
                required
                placeholder="z.B. Familienabend"
                className="rounded-xl"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-muted-foreground text-xs">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={template?.description || ""}
              placeholder="Beschreibe das Event..."
              className="rounded-xl min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Recurrence Rules */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm font-medium">Wiederholung</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="recurrence_type" className="text-muted-foreground text-xs">
              Wiederholungsart *
            </Label>
            <Select
              name="recurrence_type"
              defaultValue={template?.recurrence_type || "monthly"}
              onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Wiederholung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recurrence_interval" className="text-muted-foreground text-xs">
              Alle X {recurrenceType === "weekly" ? "Wochen" : "Monate"}
            </Label>
            <Input
              id="recurrence_interval"
              name="recurrence_interval"
              type="number"
              min="1"
              max="12"
              defaultValue={template?.recurrence_interval || 1}
              placeholder="1"
              className="rounded-xl"
            />
          </div>

          {recurrenceType === "weekly" && (
            <div className="space-y-1.5">
              <Label htmlFor="recurrence_day_of_week" className="text-muted-foreground text-xs">
                Wochentag *
              </Label>
              <Select
                name="recurrence_day_of_week"
                defaultValue={template?.recurrence_day_of_week?.toString() || "0"}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Wochentag auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {recurrenceType === "monthly" && (
            <div className="space-y-1.5">
              <Label htmlFor="recurrence_day_of_month" className="text-muted-foreground text-xs">
                Tag im Monat (1-31) *
              </Label>
              <Input
                id="recurrence_day_of_month"
                name="recurrence_day_of_month"
                type="number"
                min="1"
                max="31"
                defaultValue={template?.recurrence_day_of_month || 1}
                placeholder="1"
                className="rounded-xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Time & Capacity */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Zeit & Kapazität</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="time_of_day" className="text-muted-foreground text-xs">
              Uhrzeit
            </Label>
            <Input
              id="time_of_day"
              name="time_of_day"
              type="time"
              defaultValue={template?.time_of_day || ""}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max_attendees" className="text-muted-foreground text-xs">
              <Users className="h-3 w-3 inline mr-1" />
              Maximale Teilnehmer pro Slot
            </Label>
            <Input
              id="max_attendees"
              name="max_attendees"
              type="number"
              min="1"
              max="20"
              defaultValue={template?.max_attendees || 1}
              placeholder="1"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 rounded-xl"
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 rounded-xl">
          {loading ? "Wird gespeichert..." : template ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  )
}
