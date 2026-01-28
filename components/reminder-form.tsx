"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createReminderWithTargets, getContactsWithTags, getFamiliesWithTags } from "@/app/actions"
import { Bell, Users, Calendar, RotateCcw, FileText } from "lucide-react"
import type { Contact, Family, ReminderType, RepeatInterval } from "@/lib/db"

const reminderTypes: { value: ReminderType; label: string }[] = [
  { value: "call", label: "Anrufen" },
  { value: "invite", label: "Einladen" },
  { value: "visit", label: "Besuchen" },
  { value: "birthday", label: "Geburtstag" },
  { value: "wedding_anniversary", label: "Hochzeitstag" },
  { value: "custom", label: "Sonstiges" },
]

const repeatOptions: { value: RepeatInterval; label: string }[] = [
  { value: "none", label: "Einmalig" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
  { value: "quarterly", label: "Vierteljährlich" },
  { value: "yearly", label: "Jährlich" },
]

export function ReminderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [selectedFamilies, setSelectedFamilies] = useState<number[]>([])

  useEffect(() => {
    Promise.all([
      getContactsWithTags(),
      getFamiliesWithTags()
    ]).then(([contactsData, familiesData]) => {
      setContacts(contactsData)
      setFamilies(familiesData)
      
      // Pre-select from URL params if provided
      const contactId = searchParams.get('contact_id')
      const familyId = searchParams.get('family_id')
      if (contactId) setSelectedContacts([parseInt(contactId)])
      if (familyId) setSelectedFamilies([parseInt(familyId)])
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      type: formData.get("type") as ReminderType,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      due_date: formData.get("due_date") as string,
      repeat: formData.get("repeat_interval") as RepeatInterval,
      contact_ids: selectedContacts,
      family_ids: selectedFamilies,
    }

    try {
      await createReminderWithTargets(data)
      router.push("/reminders")
      router.refresh()
    } catch (error) {
      console.error("Error creating reminder:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type & Title Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Erinnerung</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-muted-foreground text-xs">
              Art der Erinnerung *
            </Label>
            <Select name="type" required defaultValue="call">
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Art auswählen" />
              </SelectTrigger>
              <SelectContent>
                {reminderTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-muted-foreground text-xs">
              Titel *
            </Label>
            <Input id="title" name="title" required placeholder="z.B. Familie Müller einladen" className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* Contacts & Families Multi-Select */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Menschen / Familien</span>
        </div>
        
        {/* Families */}
        {families.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Familien auswählen</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-xl p-2">
              {families.map((family) => (
                <div key={family.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`family-${family.id}`}
                    checked={selectedFamilies.includes(family.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFamilies([...selectedFamilies, family.id])
                      } else {
                        setSelectedFamilies(selectedFamilies.filter(id => id !== family.id))
                      }
                    }}
                  />
                  <label htmlFor={`family-${family.id}`} className="text-sm cursor-pointer">
                    {family.name} {family.member_count && `(${family.member_count} Mitglieder)`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {contacts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Einzelne Menschen auswählen</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-xl p-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact.id])
                      } else {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                      }
                    }}
                  />
                  <label htmlFor={`contact-${contact.id}`} className="text-sm cursor-pointer">
                    {contact.first_name} {contact.last_name}
                    {contact.family_name && ` (${contact.family_name})`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date & Repeat Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Zeitplan</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="due_date" className="text-muted-foreground text-xs">
              Fällig am *
            </Label>
            <Input id="due_date" name="due_date" type="date" required className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="repeat_interval" className="text-muted-foreground text-xs flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Wiederholen
            </Label>
            <Select name="repeat_interval" defaultValue="none">
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {repeatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Beschreibung</span>
        </div>
        <Textarea
          id="description"
          name="description"
          className="rounded-xl resize-none"
          rows={3}
          placeholder="Zusätzliche Notizen..."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
      >
        {loading ? "Speichern..." : "Erinnerung erstellen"}
      </Button>
    </form>
  )
}
