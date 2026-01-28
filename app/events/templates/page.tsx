import { PageHeader } from "@/components/page-header"
import { getEventTemplates, deleteEventTemplate } from "@/app/actions"
import { getCategoryLabel } from "@/lib/event-categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Plus, RotateCcw, Clock, Users, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/empty-state"
import { BottomNav } from "@/components/bottom-nav"

export const dynamic = 'force-dynamic'

const recurrenceLabels: Record<string, string> = {
  "weekly": "Wöchentlich",
  "monthly": "Monatlich",
}

const daysOfWeek = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const daysOfWeekFull = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
const weekOrdinals = ["", "Erster", "Zweiter", "Dritter", "Vierter", "Letzter"]

function formatRecurrenceRule(template: any): string {
  if (template.recurrence_type === "weekly") {
    const dayName = template.recurrence_day_of_week !== null 
      ? daysOfWeekFull[template.recurrence_day_of_week] 
      : ""
    const interval = template.recurrence_interval > 1 ? `alle ${template.recurrence_interval} Wochen` : "wöchentlich"
    return `${interval}${dayName ? ` am ${dayName}` : ""}`
  }
  
  if (template.recurrence_type === "monthly") {
    const interval = template.recurrence_interval > 1 ? `alle ${template.recurrence_interval} Monate` : "monatlich"
    
    if (template.recurrence_week_of_month !== null && template.recurrence_day_of_week !== null) {
      // Nth weekday pattern
      const ordinal = weekOrdinals[template.recurrence_week_of_month] || ""
      const dayName = daysOfWeekFull[template.recurrence_day_of_week] || ""
      return `${interval} - ${ordinal} ${dayName}`
    } else if (template.recurrence_day_of_month) {
      // Fixed day pattern
      return `${interval} - ${template.recurrence_day_of_month}.`
    }
  }
  
  return recurrenceLabels[template.recurrence_type] || template.recurrence_type
}

export default async function EventTemplatesPage() {
  const templates = await getEventTemplates()

  async function handleDelete(templateId: number) {
    "use server"
    await deleteEventTemplate(templateId)
    revalidatePath("/events/templates")
    revalidatePath("/events")
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Wiederkehrende Termine"
        description="Verwalte Vorlagen für automatisch generierte Termine"
        backUrl="/events"
        action={
          <Link href="/events/new">
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Neu
            </Button>
          </Link>
        }
      />

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto">
        {templates.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6 text-muted-foreground" />}
            title="Keine Vorlagen"
            description="Erstelle deine erste Vorlage für wiederkehrende Termine."
            action={
              <Link href="/events/new">
                <Button className="rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  Vorlage erstellen
                </Button>
              </Link>
            }
          />
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      {template.name}
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1.5">{template.description}</CardDescription>
                    )}
                  </div>
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(template.category)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Recurrence Info */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatRecurrenceRule(template)}
                    </span>
                  </div>
                  {template.time_of_day && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{template.time_of_day.slice(0, 5)} Uhr</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      max. {template.max_attendees} {template.max_attendees === 1 ? "Person" : "Personen"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/events/${template.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl gap-2" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                      Bearbeiten
                    </Button>
                  </Link>

                  <form action={handleDelete.bind(null, template.id)}>
                    <Button type="submit" variant="outline" className="rounded-xl" size="sm">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
