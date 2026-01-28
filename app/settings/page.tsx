import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { CongregationManager } from "@/components/congregation-manager"
import { TagManager } from "@/components/tag-manager"
import { DataManager } from "@/components/data-manager"
import { MapPin, Heart, Info, Lightbulb, Tags, Database } from "lucide-react"
import { getCongregations, getTags } from "@/app/actions"

export default async function SettingsPage() {
  const [congregations, tags] = await Promise.all([
    getCongregations(),
    getTags()
  ])

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Einstellungen" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Congregations */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Versammlungen</h2>
          </div>
          <CongregationManager initialCongregations={congregations} />
        </section>

        {/* Tags */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Tags className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Tags</h2>
          </div>
          <TagManager initialTags={tags} />
        </section>

        {/* Data Management */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Daten</h2>
          </div>
          <DataManager />
        </section>

        {/* Feature Ideas */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Geplante Features</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <FeatureItem title="Beziehungs-Score" description="Zeigt an wie gut du deine Kontakte pflegst" />
            <FeatureItem title="Gruppenaktivitäten" description="Plane Aktivitäten mit mehreren Kontakten" />
            <FeatureItem title="Gesprächsthemen" description="Notiere Themen für das nächste Gespräch" />
            <FeatureItem title="Interaktions-Historie" description="Überblick über vergangene Kontakte" />
            <FeatureItem title="Gebietskarten" description="Verknüpfe Kontakte mit Gebieten" />
          </div>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Über RemindMe</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">RemindMe</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RemindMe hilft dir dabei, deine Freundschaften zu pflegen und wichtige Termine nicht zu vergessen. Bleibe
              mit den Menschen verbunden, die dir wichtig sind.
            </p>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
      <div>
        <p className="font-medium text-card-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
