"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { RelationshipScoreBadge } from "@/components/relationship-score-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { getInviteGroupsWithScores, deleteInviteGroup, migrateToInviteGroups } from "@/app/actions"
import type { InviteGroupWithScore } from "@/lib/db"
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

export default function InviteGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<InviteGroupWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  async function loadGroups() {
    setLoading(true)
    const data = await getInviteGroupsWithScores()
    setGroups(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteInviteGroup(deleteId)
    setDeleteId(null)
    await loadGroups()
  }

  async function handleMigrate() {
    setMigrating(true)
    await migrateToInviteGroups()
    await loadGroups()
    setMigrating(false)
  }

  const familyGroups = groups.filter(g => g.family_id !== null)
  const individualGroups = groups.filter(g => g.family_id === null)

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Einladungsgruppen"
        action={
          <Link href="/invite-groups/new">
            <Button size="sm" className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Neu
            </Button>
          </Link>
        }
      />

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="Keine Einladungsgruppen"
              description="Erstelle Einladungsgruppen um festzulegen, wer zusammen eingeladen wird."
              action={
                <Link href="/invite-groups/new">
                  <Button className="rounded-xl gap-2">
                    <Plus className="h-4 w-4" />
                    Erste Gruppe erstellen
                  </Button>
                </Link>
              }
            />
            <Button
              variant="outline"
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full rounded-xl"
            >
              {migrating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Erstelle Gruppen...</>
              ) : (
                "Automatisch aus Familien & Kontakten erstellen"
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Family-based groups */}
            {familyGroups.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Familien-Gruppen
                </h2>
                <div className="space-y-2">
                  {familyGroups.map(g => (
                    <GroupCard key={g.id} group={g} onDelete={setDeleteId} />
                  ))}
                </div>
              </section>
            )}

            {/* Individual groups */}
            {individualGroups.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Einzelne
                </h2>
                <div className="space-y-2">
                  {individualGroups.map(g => (
                    <GroupCard key={g.id} group={g} onDelete={setDeleteId} />
                  ))}
                </div>
              </section>
            )}

            <Button
              variant="ghost"
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full text-muted-foreground"
            >
              {migrating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Erstelle fehlende Gruppen...</>
              ) : (
                "Fehlende Gruppen automatisch erstellen"
              )}
            </Button>
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gruppe löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Einladungsgruppe wird gelöscht. Die Kontakte selbst bleiben erhalten.
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

      <BottomNav />
    </div>
  )
}

function GroupCard({ group, onDelete }: { group: InviteGroupWithScore; onDelete: (id: number) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
      <div className="flex -space-x-2 shrink-0">
        {group.members.slice(0, 3).map((m, i) => (
          <div
            key={m.id}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-xs font-bold border-2 border-card"
            style={{ zIndex: 3 - i }}
          >
            {m.first_name[0]}{m.last_name[0]}
          </div>
        ))}
        {group.members.length > 3 && (
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
            +{group.members.length - 3}
          </div>
        )}
        {group.members.length === 0 && (
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{group.name}</p>
        <p className="text-xs text-muted-foreground">
          {group.members.length} {group.members.length === 1 ? "Person" : "Personen"}
          {group.family_name && ` · ${group.family_name}`}
        </p>
      </div>

      <RelationshipScoreBadge score={group.score} size="sm" />

      <div className="flex gap-1 shrink-0">
        <Link href={`/invite-groups/new?edit=${group.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDelete(group.id)}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
