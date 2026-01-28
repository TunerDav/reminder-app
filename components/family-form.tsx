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
import { createFamily, updateFamily, getCongregations, getTags, getFamilyTags, addTagToFamily, removeTagFromFamily } from "@/app/actions"
import { Users, Phone, MapPin, FileText, Tags as TagsIcon } from "lucide-react"
import type { Family, Congregation, Tag } from "@/lib/db"

interface FamilyFormProps {
  family?: Family
}

export function FamilyForm({ family }: FamilyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [congregations, setCongregations] = useState<Congregation[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  useEffect(() => {
    Promise.all([
      getCongregations(),
      getTags(),
      family ? getFamilyTags(family.id) : Promise.resolve([])
    ]).then(([congs, tags, familyTags]) => {
      setCongregations(congs)
      setAllTags(tags)
      setSelectedTags(familyTags)
    })
  }, [family])

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
      congregation_id: formData.get("congregation_id") ? Number(formData.get("congregation_id")) : null,
      notes: (formData.get("notes") as string) || null,
    }

    try {
      let familyId: number
      if (family) {
        await updateFamily(family.id, data)
        familyId = family.id
        
        // Update tags
        const currentTags = await getFamilyTags(family.id)
        const currentTagIds = new Set(currentTags.map(t => t.id))
        const selectedTagIds = new Set(selectedTags.map(t => t.id))
        
        // Remove tags
        for (const tag of currentTags) {
          if (!selectedTagIds.has(tag.id)) {
            await removeTagFromFamily(family.id, tag.id)
          }
        }
        
        // Add tags
        for (const tag of selectedTags) {
          if (!currentTagIds.has(tag.id)) {
            await addTagToFamily(family.id, tag.id)
          }
        }
        router.push(`/families/${familyId}`)
      } else {
        familyId = await createFamily(data)
        
        // Add tags for new family
        for (const tag of selectedTags) {
          await addTagToFamily(familyId, tag.id)
        }
        router.push(`/families/${familyId}`)
      }
      router.refresh()
    } catch (error) {
      console.error("Error saving family:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Familienname</span>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-muted-foreground text-xs">
            Name *
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={family?.name}
            required
            className="rounded-xl"
            placeholder="z.B. Familie Müller"
          />
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
              Telefon (gemeinsam)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={family?.phone || ""}
              className="rounded-xl"
              placeholder="+49 123 456789"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-muted-foreground text-xs">
              E-Mail (gemeinsam)
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={family?.email || ""}
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
          <span className="text-sm font-medium">Ort</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-muted-foreground text-xs">
              Adresse (gemeinsam)
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={family?.address || ""}
              className="rounded-xl resize-none"
              rows={2}
              placeholder="Straße, PLZ Ort"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="congregation_id" className="text-muted-foreground text-xs">
              Versammlung
            </Label>
            <Select name="congregation_id" defaultValue={family?.congregation_id?.toString()}>
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

      {/* Notes Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Notizen</span>
        </div>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={family?.notes || ""}
          className="rounded-xl resize-none"
          rows={3}
          placeholder="Notizen zur Familie..."
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
        {loading ? "Speichern..." : family ? "Aktualisieren" : "Familie erstellen"}
      </Button>
    </form>
  )
}
