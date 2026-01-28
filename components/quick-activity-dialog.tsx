"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PhoneCall, Users, MessageCircle, Activity, Coffee, Dumbbell, Plus, Search, Loader2 } from "lucide-react"
import { createBulkInteraction, getInviteGroups } from "@/app/actions"
import type { InviteGroupWithMembers } from "@/lib/db"

const ACTIVITY_TYPES = [
  { value: "call", label: "Anruf", icon: PhoneCall },
  { value: "visit", label: "Besuch", icon: Users },
  { value: "message", label: "Nachricht", icon: MessageCircle },
  { value: "badminton", label: "Badminton", icon: Dumbbell },
  { value: "treffen", label: "Treffen", icon: Coffee },
]

interface QuickActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickActivityDialog({ open, onOpenChange }: QuickActivityDialogProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<InviteGroupWithMembers[]>([])
  const [selectedType, setSelectedType] = useState("")
  const [customType, setCustomType] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getInviteGroups().then(g => {
        setGroups(g)
        setLoading(false)
      })
    }
  }, [open])

  function reset() {
    setSelectedType("")
    setCustomType("")
    setShowCustom(false)
    setSelectedGroups([])
    setDate(new Date().toISOString().split("T")[0])
    setNotes("")
    setSearch("")
  }

  async function handleSave() {
    const type = showCustom ? customType.trim() : selectedType
    if (!type || selectedGroups.length === 0) return

    setSaving(true)
    try {
      await createBulkInteraction({
        invite_group_ids: selectedGroups,
        type,
        notes: notes.trim() || null,
        interaction_date: date,
      })
      reset()
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving activity:", error)
    } finally {
      setSaving(false)
    }
  }

  function toggleGroup(id: number) {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const activeType = showCustom ? customType.trim() : selectedType
  const canSave = activeType.length > 0 && selectedGroups.length > 0

  const filteredGroups = groups.filter(g => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      g.name.toLowerCase().includes(s) ||
      g.members.some(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(s)
      )
    )
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aktivität erfassen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Art der Aktivität</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(t => (
                <Button
                  key={t.value}
                  variant={selectedType === t.value && !showCustom ? "default" : "outline"}
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => { setSelectedType(t.value); setShowCustom(false) }}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </Button>
              ))}
              <Button
                variant={showCustom ? "default" : "outline"}
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => { setShowCustom(true); setSelectedType("") }}
              >
                <Plus className="h-3.5 w-3.5" />
                Andere
              </Button>
            </div>
            {showCustom && (
              <Input
                placeholder="z.B. Kino, Sport, Essen..."
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
          </div>

          {/* Invite Groups Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Mit wem? ({selectedGroups.length} ausgewählt)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-xl p-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {groups.length === 0 ? "Keine Einladungsgruppen vorhanden" : "Keine Ergebnisse"}
                </p>
              ) : (
                filteredGroups.map(g => (
                  <div
                    key={g.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleGroup(g.id)}
                  >
                    <Checkbox
                      checked={selectedGroups.includes(g.id)}
                      onCheckedChange={() => toggleGroup(g.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{g.name}</p>
                      {g.members.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {g.members.map(m => m.first_name).join(", ")}
                        </p>
                      )}
                    </div>
                    {g.family_name && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {g.family_name}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Datum</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notizen (optional)</Label>
            <Textarea
              placeholder="Kurze Notiz zur Aktivität..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => { reset(); onOpenChange(false) }}
            className="flex-1 rounded-xl"
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              "Aktivität erfassen"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
