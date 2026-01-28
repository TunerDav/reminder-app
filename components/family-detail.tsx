"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Phone, Mail, MapPin, Edit, Trash2, MessageCircle, Users, PhoneCall, MessageSquare, Navigation, UserPlus, UserMinus, Activity, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReminderCard } from "./reminder-card"
import { RelationshipScoreBadge } from "./relationship-score-badge"
import { deleteFamily, createInteraction, removeContactFromFamily } from "@/app/actions"
import type { Family, Reminder, Interaction, Tag, Contact, InviteGroupWithScore } from "@/lib/db"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FamilyDetailProps {
  family: Family
  tags: Tag[]
  members: Contact[]
  reminders: Reminder[]
  interactions: Interaction[]
  inviteGroups?: InviteGroupWithScore[]
}

const interactionTypes = [
  { value: "call", label: "Anruf", icon: PhoneCall },
  { value: "visit", label: "Besuch", icon: Users },
  { value: "message", label: "Nachricht", icon: MessageCircle },
]

export function FamilyDetail({ family, tags, members, reminders, interactions, inviteGroups }: FamilyDetailProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [savingInteraction, setSavingInteraction] = useState(false)
  const [removingMember, setRemovingMember] = useState<number | null>(null)

  const formatAddress = (address: string | null) => {
    if (!address) return ""
    return address.replace(/\n/g, ", ")
  }

  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return ""
    const cleaned = phone.replace(/\s/g, "").replace(/\+/g, "")
    return `https://wa.me/${cleaned}`
  }

  const getMapsLink = (address: string | null) => {
    if (!address) return ""
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(address))}`
  }

  async function handleDelete() {
    await deleteFamily(family.id)
    router.push("/families")
  }

  async function handleQuickInteraction(type: string) {
    setSavingInteraction(true)
    await createInteraction({
      family_id: family.id,
      type,
      interaction_date: new Date().toISOString().split("T")[0],
    })
    router.refresh()
    setSavingInteraction(false)
  }

  async function handleRemoveMember(contactId: number) {
    setRemovingMember(contactId)
    await removeContactFromFamily(contactId)
    router.refresh()
    setRemovingMember(null)
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-2xl font-bold mb-3 shadow-sm">
          {family.photo_url ? (
            <img
              src={family.photo_url || "/placeholder.svg"}
              alt={family.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <Users className="h-12 w-12" />
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground">{family.name}</h2>
        {family.congregation_name && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {family.congregation_name}
          </p>
        )}
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs px-2 py-0.5"
                style={{ 
                  borderColor: tag.color,
                  backgroundColor: `${tag.color}15`,
                  color: tag.color
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {family.phone && (
          <>
            <a
              href={`tel:${family.phone}`}
              className="flex flex-col items-center gap-1 p-3 bg-green-500/10 rounded-xl text-green-600 hover:bg-green-500/20 transition-colors"
              onClick={() => handleQuickInteraction("call")}
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs font-medium">Anrufen</span>
            </a>
            <a
              href={getWhatsAppLink(family.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-3 bg-green-600/10 rounded-xl text-green-700 hover:bg-green-600/20 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </>
        )}
        {family.email && (
          <a
            href={`mailto:${family.email}`}
            className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 rounded-xl text-blue-600 hover:bg-blue-500/20 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs font-medium">E-Mail</span>
          </a>
        )}
        {family.address && (
          <a
            href={getMapsLink(family.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-orange-500/10 rounded-xl text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs font-medium">Route</span>
          </a>
        )}
        <Link
          href={`/families/${family.id}/edit`}
          className="flex flex-col items-center gap-1 p-3 bg-muted rounded-xl text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <Edit className="h-5 w-5" />
          <span className="text-xs font-medium">Bearbeiten</span>
        </Link>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        {family.phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.phone}</span>
          </div>
        )}
        {family.email && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.email}</span>
          </div>
        )}
        {family.address && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.address}</span>
          </div>
        )}
      </div>

      {/* Family Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Mitglieder ({members.length})</h3>
          <Link href={`/contacts/new?familyId=${family.id}`}>
            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Hinzufügen
            </Button>
          </Link>
        </div>
        {members.length > 0 ? (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border shadow-sm"
              >
                <Link href={`/contacts/${member.id}`} className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-sm font-bold">
                      {`${member.first_name[0]}${member.last_name[0]}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.phone && (
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      )}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMember === member.id}
                  className="h-8 w-8 p-0"
                >
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Noch keine Mitglieder</p>
            <p className="text-xs mt-1">Fügen Sie Personen zu dieser Familie hinzu</p>
          </div>
        )}
      </div>

      {/* Einladungsgruppen */}
      {inviteGroups && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Einladungsgruppen</h3>
            <Link href={`/invite-groups/new?familyId=${family.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Neue Gruppe
              </Button>
            </Link>
          </div>
          {inviteGroups.length > 0 ? (
            <div className="space-y-2">
              {inviteGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.members.map(m => m.first_name).join(", ")}
                    </p>
                  </div>
                  <RelationshipScoreBadge score={group.score} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>Noch keine Einladungsgruppen</p>
              <p className="text-xs mt-1">Lege fest, wer zusammen eingeladen wird</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {family.notes && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-2">Notizen</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{family.notes}</p>
        </div>
      )}

      {/* Quick Interaction Buttons */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Interaktion erfassen</h3>
        <div className="flex gap-2">
          {interactionTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              onClick={() => handleQuickInteraction(type.value)}
              disabled={savingInteraction}
              className="flex-1 rounded-xl h-11"
            >
              <type.icon className="h-4 w-4 mr-1.5" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Interactions */}
      {interactions.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Letzte Interaktionen</h3>
          <div className="space-y-2">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm"
              >
                <div className="p-2 rounded-lg bg-muted">
                  {interaction.type === "call" ? <PhoneCall className="h-4 w-4 text-muted-foreground" /> :
                   interaction.type === "visit" ? <Users className="h-4 w-4 text-muted-foreground" /> :
                   interaction.type === "message" ? <MessageCircle className="h-4 w-4 text-muted-foreground" /> :
                   <Activity className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground capitalize">
                    {interaction.type === "call" ? "Anruf" : interaction.type === "visit" ? "Besuch" : interaction.type === "message" ? "Nachricht" : interaction.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(interaction.interaction_date).toLocaleDateString("de-DE")}
                  </p>
                  {interaction.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{interaction.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {reminders.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Erinnerungen</h3>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Delete Button */}
      <Button
        variant="destructive"
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full rounded-xl"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Familie löschen
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Familie wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Familie wird dauerhaft gelöscht.
              Die Mitglieder der Familie werden nicht gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
