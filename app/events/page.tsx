"use client"

import { PageHeader } from "@/components/page-header"
import { EventSlotCard } from "@/components/event-slot-card"
import { getUpcomingSlots, assignContactToSlot, assignInviteGroupsToSlot, updateSlotStatus, getContactsWithTags, getFamiliesWithTags, getInviteGroupsWithScores } from "@/app/actions"
import { RelationshipScoreBadge } from "@/components/relationship-score-badge"
import { Button } from "@/components/ui/button"
import { CalendarClock, Settings, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { EventSlotWithDetails, InviteGroupWithScore } from "@/lib/db"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"

export default function EventsPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<EventSlotWithDetails[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [inviteGroupsScored, setInviteGroupsScored] = useState<InviteGroupWithScore[]>([])
  const [selectedSlot, setSelectedSlot] = useState<EventSlotWithDetails | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [selectedFamilies, setSelectedFamilies] = useState<number[]>([])
  const [selectedInviteGroups, setSelectedInviteGroups] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "available" | "assigned">("all")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [slotsData, contactsData, familiesData, groupsData] = await Promise.all([
      getUpcomingSlots(30),
      getContactsWithTags(),
      getFamiliesWithTags(),
      getInviteGroupsWithScores(),
    ])
    setSlots(slotsData)
    setContacts(contactsData)
    setFamilies(familiesData)
    setInviteGroupsScored(groupsData.sort((a, b) => a.score.score - b.score.score))
  }

  function handleOpenInviteDialog(slot: EventSlotWithDetails) {
    setSelectedSlot(slot)

    // Pre-fill with existing assignments
    if (slot.contacts) {
      setSelectedContacts(slot.contacts.map(c => c.id))
    }
    if (slot.families) {
      setSelectedFamilies(slot.families.map(f => f.id))
    }

    setInviteDialogOpen(true)
  }

  async function handleAssignContacts() {
    if (!selectedSlot) return

    setLoading(true)
    try {
      // Assign traditional contacts/families
      await assignContactToSlot(selectedSlot.id, selectedContacts, selectedFamilies)
      // Also assign invite groups
      if (selectedInviteGroups.length > 0) {
        await assignInviteGroupsToSlot(selectedSlot.id, selectedInviteGroups)
      }
      await loadData()
      setInviteDialogOpen(false)
      setSelectedContacts([])
      setSelectedFamilies([])
      setSelectedInviteGroups([])
      setSelectedSlot(null)
      router.refresh()
    } catch (error) {
      console.error("Error assigning contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(slotId: number) {
    await updateSlotStatus(slotId, "completed")
    await loadData()
    router.refresh()
  }

  const filteredSlots = slots.filter(slot => {
    if (filter === "all") return true
    if (filter === "available") return slot.status === "available"
    if (filter === "assigned") return slot.status === "assigned"
    return true
  })

  const availableCount = slots.filter(s => s.status === "available").length
  const assignedCount = slots.filter(s => s.status === "assigned").length

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Termine"
        action={
          <Link href="/events/templates">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <Settings className="h-4 w-4" />
              Vorlagen
            </Button>
          </Link>
        }
      />

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Alle ({slots.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Offen ({availableCount})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Eingeladen ({assignedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Slots List */}
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-6 w-6 text-muted-foreground" />}
              title={filter === "all" ? "Keine anstehenden Termine" : `Keine ${filter === "available" ? "offenen" : "eingeladenen"} Termine`}
              description={
                filter === "all"
                  ? "Erstelle wiederkehrende Termine, um automatisch Termine zu generieren."
                  : `Es gibt aktuell keine ${filter === "available" ? "offenen" : "eingeladenen"} Termine.`
              }
              action={
                filter === "all" && (
                  <Link href="/events/templates">
                    <Button className="rounded-xl gap-2">
                      <Settings className="h-4 w-4" />
                      Vorlagen verwalten
                    </Button>
                  </Link>
                )
              }
            />
          ) : (
            filteredSlots.map((slot) => (
              <EventSlotCard
                key={slot.id}
                slot={slot}
                onInvite={handleOpenInviteDialog}
                onComplete={handleComplete}
                showActions={true}
              />
            ))
          )}
        </div>

        {/* Link to templates */}
        {slots.length > 0 && (
          <div className="pt-4">
            <Link href="/events/templates">
              <Button variant="ghost" className="w-full text-muted-foreground gap-2">
                <Settings className="h-4 w-4" />
                Wiederkehrende Termine verwalten
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Menschen einladen</DialogTitle>
            <DialogDescription>
              Wähle Menschen oder Familien für "{selectedSlot?.event_template_name}" am{" "}
              {selectedSlot && new Date(selectedSlot.slot_date).toLocaleDateString("de-DE")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Suggestions - low score invite groups */}
            {inviteGroupsScored.filter(g => g.score.score < 50).length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5 text-chart-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Vorschläge — braucht Aufmerksamkeit
                </Label>
                <div className="flex flex-wrap gap-2">
                  {inviteGroupsScored
                    .filter(g => g.score.score < 50)
                    .slice(0, 5)
                    .map(group => (
                      <Button
                        key={group.id}
                        variant={selectedInviteGroups.includes(group.id) ? "default" : "outline"}
                        size="sm"
                        className="rounded-full gap-1.5"
                        onClick={() => {
                          setSelectedInviteGroups(prev =>
                            prev.includes(group.id)
                              ? prev.filter(id => id !== group.id)
                              : [...prev, group.id]
                          )
                        }}
                      >
                        {group.name}
                        <RelationshipScoreBadge score={group.score} size="sm" />
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Invite Groups */}
            {inviteGroupsScored.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Einladungsgruppen</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-3">
                  {inviteGroupsScored.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dialog-group-${group.id}`}
                        checked={selectedInviteGroups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInviteGroups([...selectedInviteGroups, group.id])
                          } else {
                            setSelectedInviteGroups(selectedInviteGroups.filter(id => id !== group.id))
                          }
                        }}
                      />
                      <label htmlFor={`dialog-group-${group.id}`} className="text-sm cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <span>{group.name}</span>
                          <RelationshipScoreBadge score={group.score} size="sm" />
                        </div>
                        {group.members.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {group.members.map(m => m.first_name).join(", ")}
                          </p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Families */}
            {families.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Familien</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-3">
                  {families.map((family) => (
                    <div key={family.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dialog-family-${family.id}`}
                        checked={selectedFamilies.includes(family.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFamilies([...selectedFamilies, family.id])
                          } else {
                            setSelectedFamilies(selectedFamilies.filter(id => id !== family.id))
                          }
                        }}
                      />
                      <label htmlFor={`dialog-family-${family.id}`} className="text-sm cursor-pointer flex-1">
                        {family.name}
                        {family.tags && family.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {family.tags.map((tag: any) => (
                              <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color, color: tag.color }}>
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Einzelne Menschen</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dialog-contact-${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContacts([...selectedContacts, contact.id])
                          } else {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                          }
                        }}
                      />
                      <label htmlFor={`dialog-contact-${contact.id}`} className="text-sm cursor-pointer flex-1">
                        {contact.first_name} {contact.last_name}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contact.tags.map((tag: any) => (
                              <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color, color: tag.color }}>
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <p>
                  Kapazität: {selectedContacts.length + selectedFamilies.length + selectedInviteGroups.length} / {selectedSlot.template?.max_attendees || (selectedSlot as any).max_attendees || 1}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInviteDialogOpen(false)
                setSelectedContacts([])
                setSelectedFamilies([])
                setSelectedInviteGroups([])
              }}
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAssignContacts}
              disabled={loading || (selectedContacts.length === 0 && selectedFamilies.length === 0 && selectedInviteGroups.length === 0)}
              className="flex-1 rounded-xl"
            >
              {loading ? "Wird gespeichert..." : "Einladen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
