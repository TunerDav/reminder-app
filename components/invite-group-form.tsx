"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createInviteGroup, updateInviteGroup } from "@/app/actions"
import type { ContactWithTags, FamilyFlat, InviteGroupWithMembers } from "@/lib/db"

interface InviteGroupFormProps {
  contacts: ContactWithTags[]
  families: FamilyFlat[]
  existingGroup: InviteGroupWithMembers | null
  preselectedFamilyId: number | null
}

export function InviteGroupForm({ contacts, families, existingGroup, preselectedFamilyId }: InviteGroupFormProps) {
  const router = useRouter()
  const [name, setName] = useState(existingGroup?.name ?? "")
  const [familyId, setFamilyId] = useState<number | null>(existingGroup?.family_id ?? preselectedFamilyId ?? null)
  const [selectedContacts, setSelectedContacts] = useState<number[]>(
    existingGroup?.members.map(m => m.id) ?? []
  )
  const [notes, setNotes] = useState(existingGroup?.notes ?? "")
  const [saving, setSaving] = useState(false)

  // Filter contacts by family if selected
  const filteredContacts = familyId
    ? contacts.filter(c => c.family_id === familyId || selectedContacts.includes(c.id))
    : contacts

  // Auto-generate name from selected contacts
  useEffect(() => {
    if (existingGroup) return // Don't auto-generate when editing
    const selected = contacts.filter(c => selectedContacts.includes(c.id))
    if (selected.length === 0) {
      setName("")
    } else if (selected.length === 1) {
      setName(`${selected[0].first_name} ${selected[0].last_name}`)
    } else if (selected.length === 2) {
      setName(`${selected[0].first_name} & ${selected[1].first_name}`)
    } else {
      setName(`${selected[0].first_name}, ${selected[1].first_name} + ${selected.length - 2}`)
    }
  }, [selectedContacts, contacts, existingGroup])

  function toggleContact(id: number) {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || selectedContacts.length === 0) return

    setSaving(true)
    try {
      if (existingGroup) {
        await updateInviteGroup(existingGroup.id, {
          name: name.trim(),
          contact_ids: selectedContacts,
          notes: notes.trim() || null,
        })
      } else {
        await createInviteGroup({
          name: name.trim(),
          family_id: familyId,
          contact_ids: selectedContacts,
          notes: notes.trim() || null,
        })
      }
      router.push("/invite-groups")
      router.refresh()
    } catch (error) {
      console.error("Error saving invite group:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Family Filter */}
      <div className="space-y-2">
        <Label>Familie (optional)</Label>
        <Select
          value={familyId?.toString() ?? "none"}
          onValueChange={v => setFamilyId(v === "none" ? null : parseInt(v))}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Keine Familie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Familie</SelectItem>
            {families.map(f => (
              <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contact Selection */}
      <div className="space-y-2">
        <Label>Mitglieder *</Label>
        <div className="max-h-64 overflow-y-auto space-y-1 border rounded-xl p-3">
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Kontakte gefunden</p>
          ) : (
            filteredContacts.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleContact(c.id)}
              >
                <Checkbox
                  checked={selectedContacts.includes(c.id)}
                  onCheckedChange={() => toggleContact(c.id)}
                />
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {c.first_name[0]}{c.last_name[0]}
                </div>
                <span className="text-sm">{c.first_name} {c.last_name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label>Gruppenname *</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="z.B. Roco & Lydia"
          className="rounded-xl"
          required
        />
        <p className="text-xs text-muted-foreground">
          Wird automatisch generiert, kann aber angepasst werden.
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notizen (optional)</Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="z.B. Ehepaar, oder Einzelperson..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 rounded-xl"
          disabled={saving}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          disabled={saving || !name.trim() || selectedContacts.length === 0}
          className="flex-1 rounded-xl"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Speichern...</>
          ) : existingGroup ? (
            "Aktualisieren"
          ) : (
            "Erstellen"
          )}
        </Button>
      </div>
    </form>
  )
}
