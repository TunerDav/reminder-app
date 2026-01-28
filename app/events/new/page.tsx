import { PageHeader } from "@/components/page-header"
import { EventTemplateForm } from "@/components/event-template-form"
import { getEventCategories } from "@/app/actions"

export default async function NewEventTemplatePage() {
  const categories = await getEventCategories()

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Neue Event-Vorlage"
        description="Erstelle eine wiederkehrende Event-Vorlage"
        backUrl="/events"
      />

      <div className="px-4 pt-4">
        <EventTemplateForm categories={categories} />
      </div>
    </div>
  )
}
