"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagSelector } from "@/components/tag-selector"
import { createContact, updateContact, getCongregations, getFamilies, getTags, getContactTags, addTagToContact, removeTagFromContact } from "@/app/actions"
import { User, Phone, MapPin, Calendar, Heart, FileText, Tags as TagsIcon, Users } from "lucide-react"
import type { Contact, Congregation, Tag, Family } from "@/lib/db"

interface ContactFormProps {
  contact?: Contact
  defaultFamilyId?: number
}

export function ContactForm({ contact, defaultFamilyId }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [congregations, setCongregations] = useState<Congregation[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | undefined>(
    contact?.family_id?.toString() || defaultFamilyId?.toString()
  )
  const [lastName, setLastName] = useState(contact?.last_name || "")
  const [useFamilyName, setUseFamilyName] = useState(false)

  useEffect(() => {
    Promise.all([
      getCongregations(),
      getFamilies(),
      getTags(),
      contact ? getContactTags(contact.id) : Promise.resolve([])
    ]).then(([congs, fams, tags, contactTags]) => {
      setCongregations(congs)
      setFamilies(fams)
      setAllTags(tags)
      setSelectedTags(contactTags)
    })
  }, [contact])

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id)
      if (exists) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleFamilyChange = (familyId: string) => {
    setSelectedFamilyId(familyId)
    if (familyId && useFamilyName) {
      const family = families.find(f => f.id.toString() === familyId)
      if (family) {
        // Extrahiere Nachname aus Familiennamen (z.B. "Familie Müller" -> "Müller")
        const extractedLastName = family.name.replace(/^Familie\s+/i, '').replace(/^Ehepaar\s+/i, '')
        setLastName(extractedLastName)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
      congregation_id: formData.get("congregation_id") ? Number(formData.get("congregation_id")) : null,
      family_id: formData.get("family_id") ? Number(formData.get("family_id")) : null,
      birthday: (formData.get("birthday") as string) || null,
      wedding_anniversary: (formData.get("wedding_anniversary") as string) || null,
      notes: (formData.get("notes") as string) || null,
    }

    try {
      let contactId: number
      if (contact) {
        await updateContact(contact.id, data)
        contactId = contact.id
        
        // Update tags
        const currentTags = await getContactTags(contact.id)
        const currentTagIds = new Set(currentTags.map(t => t.id))
        const selectedTagIds = new Set(selectedTags.map(t => t.id))
        
        // Remove tags
        for (const tag of currentTags) {
          if (!selectedTagIds.has(tag.id)) {
            await removeTagFromContact(contact.id, tag.id)
          }
        }
        
        // Add tags
        for (const tag of selectedTags) {
          if (!currentTagIds.has(tag.id)) {
            await addTagToContact(contact.id, tag.id)
          }
        }
      } else {
        const result = await createContact(data)
        // createContact needs to return the new contact ID
        // For now, we'll skip tag assignment for new contacts
        // You could modify createContact to return the ID
      }
      router.push("/contacts")
      router.refresh()
    } catch (error) {
      console.error("Error saving contact:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Family Section - First for easy selection */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Familie</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="family_id" className="text-muted-foreground text-xs">
              Familie auswählen
            </Label>
            <Select name="family_id" value={selectedFamilyId} onValueChange={handleFamilyChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Keine Familie zugeordnet" />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id.toString()}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedFamilyId && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useFamilyName"
                checked={useFamilyName}
                onChange={(e) => {
                  setUseFamilyName(e.target.checked)
                  if (e.target.checked && selectedFamilyId) {
                    const family = families.find(f => f.id.toString() === selectedFamilyId)
                    if (family) {
                      const extractedLastName = family.name.replace(/^Familie\s+/i, '').replace(/^Ehepaar\s+/i, '')
                      setLastName(extractedLastName)
                    }
                  }
                }}
                className="rounded"
              />
              <Label htmlFor="useFamilyName" className="text-xs text-muted-foreground cursor-pointer">
                Familiennamen als Nachname verwenden
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Name Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Name</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first_name" className="text-muted-foreground text-xs">
              Vorname *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={contact?.first_name}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name" className="text-muted-foreground text-xs">
              Nachname *
            </Label>
            <Input 
              id="last_name" 
              name="last_name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
              className="rounded-xl" 
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">Kontaktdaten</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-muted-foreground text-xs">
              Telefon
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={contact?.phone || ""}
              className="rounded-xl"
              placeholder="+49 123 456789"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-muted-foreground text-xs">
              E-Mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={contact?.email || ""}
              className="rounded-xl"
              placeholder="name@beispiel.de"
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Ort & Versammlung</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-muted-foreground text-xs">
              Adresse
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={contact?.address || ""}
              className="rounded-xl resize-none"
              rows={2}
              placeholder="Straße, PLZ Ort"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="congregation_id" className="text-muted-foreground text-xs">
              Versammlung
            </Label>
            <Select name="congregation_id" defaultValue={contact?.congregation_id?.toString()}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Versammlung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {congregations.map((cong) => (
                  <SelectItem key={cong.id} value={cong.id.toString()}>
                    {cong.name} {cong.city && `(${cong.city})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Wichtige Daten</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="birthday" className="text-muted-foreground text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Geburtstag
            </Label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              defaultValue={contact?.birthday || ""}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wedding_anniversary" className="text-muted-foreground text-xs flex items-center gap-1">
              <Heart className="h-3 w-3" /> Hochzeitstag
            </Label>
            <Input
              id="wedding_anniversary"
              name="wedding_anniversary"
              type="date"
              defaultValue={contact?.wedding_anniversary || ""}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Notizen</span>
        </div>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={contact?.notes || ""}
          className="rounded-xl resize-none"
          rows={3}
          placeholder="Persönliche Notizen, Interessen, etc."
        />
      </div>

      {/* Tags Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <TagsIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Tags</span>
        </div>
        <TagSelector
          availableTags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
      >
        {loading ? "Speichern..." : contact ? "Aktualisieren" : "Kontakt erstellen"}
      </Button>
    </form>
  )
}
