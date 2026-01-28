"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Phone, Mail, MapPin, Calendar, Heart, Edit, Trash2, MessageCircle, Users, PhoneCall, MessageSquare, Navigation, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReminderCard } from "./reminder-card"
import { RelationshipScoreBadge } from "./relationship-score-badge"
import { deleteContact, createInteraction } from "@/app/actions"
import type { Contact, Reminder, Interaction, Tag, ScoreResult } from "@/lib/db"

interface ContactDetailProps {
  contact: Contact
  tags: Tag[]
  reminders: Reminder[]
  interactions: Interaction[]
  score?: ScoreResult
}

function getRelationshipStatus(lastInteractionDate: string | null) {
  if (!lastInteractionDate) {
    return { status: "none", label: "Noch nie kontaktiert", color: "text-muted-foreground", bgColor: "bg-muted" }
  }

  const lastDate = new Date(lastInteractionDate)
  const today = new Date()
  const diffTime = today.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return { status: "good", label: `Vor ${diffDays} ${diffDays === 1 ? "Tag" : "Tagen"}`, color: "text-green-600", bgColor: "bg-green-500/10" }
  } else if (diffDays <= 30) {
    return { status: "medium", label: `Vor ${diffDays} Tagen`, color: "text-yellow-600", bgColor: "bg-yellow-500/10" }
  } else {
    const weeks = Math.floor(diffDays / 7)
    const months = Math.floor(diffDays / 30)
    const label = months > 0 ? `Vor ${months} ${months === 1 ? "Monat" : "Monaten"}` : `Vor ${weeks} Wochen`
    return { status: "poor", label, color: "text-red-600", bgColor: "bg-red-500/10" }
  }
}

const interactionTypes = [
  { value: "call", label: "Anruf", icon: PhoneCall },
  { value: "visit", label: "Besuch", icon: Users },
  { value: "message", label: "Nachricht", icon: MessageCircle },
]

export function ContactDetail({ contact, tags, reminders, interactions, score }: ContactDetailProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [savingInteraction, setSavingInteraction] = useState(false)

  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()

  // Beziehungs-Status basierend auf letzter Interaktion
  const lastInteraction = interactions.length > 0 ? interactions[0].interaction_date : null
  const relationshipStatus = getRelationshipStatus(lastInteraction)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
    })
  }

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
    await deleteContact(contact.id)
    router.push("/contacts")
  }

  async function handleQuickInteraction(type: string) {
    setSavingInteraction(true)
    await createInteraction({
      contact_id: contact.id,
      type,
      interaction_date: new Date().toISOString().split("T")[0],
    })
    router.refresh()
    setSavingInteraction(false)
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-2xl font-bold mb-3 shadow-sm">
          {contact.photo_url ? (
            <img
              src={contact.photo_url || "/placeholder.svg"}
              alt={`${contact.first_name} ${contact.last_name}`}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {contact.first_name} {contact.last_name}
        </h2>
        {contact.congregation_name && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {contact.congregation_name}
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

        {/* Beziehungsscore */}
        {score && (
          <div className="mt-3">
            <RelationshipScoreBadge score={score} size="lg" />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {contact.phone && (
          <>
            <a
              href={`tel:${contact.phone}`}
              className="flex flex-col items-center gap-1 p-3 bg-green-500/10 rounded-xl text-green-600 hover:bg-green-500/20 transition-colors"
              onClick={() => handleQuickInteraction("call")}
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs font-medium">Anrufen</span>
            </a>
            <a
              href={getWhatsAppLink(contact.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-3 bg-green-600/10 rounded-xl text-green-700 hover:bg-green-600/20 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 rounded-xl text-blue-600 hover:bg-blue-500/20 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs font-medium">E-Mail</span>
          </a>
        )}
        {contact.address && (
          <a
            href={getMapsLink(contact.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-orange-500/10 rounded-xl text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs font-medium">Route</span>
          </a>
        )}
        <Link
          href={`/contacts/${contact.id}/edit`}
          className="flex flex-col items-center gap-1 p-3 bg-muted rounded-xl text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <Edit className="h-5 w-5" />
          <span className="text-xs font-medium">Bearbeiten</span>
        </Link>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        {contact.phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{contact.email}</span>
          </div>
        )}
        {contact.address && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{contact.address}</span>
          </div>
        )}
        {contact.birthday && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Calendar className="h-4 w-4 text-chart-3" />
            </div>
            <span className="text-card-foreground">Geburtstag: {formatDate(contact.birthday)}</span>
          </div>
        )}
        {contact.wedding_anniversary && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Heart className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-card-foreground">Hochzeitstag: {formatDate(contact.wedding_anniversary)}</span>
          </div>
        )}
        {contact.family_id && contact.family_name && (
          <Link href={`/families/${contact.family_id}`}>
            <div className="flex items-center gap-3 hover:bg-muted/50 -m-1 p-1 rounded-lg transition-colors">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-card-foreground">{contact.family_name}</span>
                <p className="text-xs text-muted-foreground">Gehört zu dieser Familie</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-2">Notizen</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{contact.notes}</p>
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
                    {new Date(interaction.interaction_date).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders */}
      {reminders.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Erinnerungen</h3>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="pt-4">
        {showDeleteConfirm ? (
          <div className="bg-destructive/10 rounded-2xl p-4 space-y-3 border border-destructive/20">
            <p className="text-sm text-center text-destructive font-medium">Kontakt wirklich löschen?</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl">
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1 rounded-xl">
                Löschen
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kontakt löschen
          </Button>
        )}
      </div>
    </div>
  )
}
