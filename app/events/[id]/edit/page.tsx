import { PageHeader } from "@/components/page-header"
import { EventTemplateForm } from "@/components/event-template-form"
import { getEventTemplate, getEventCategories } from "@/app/actions"
import { notFound } from "next/navigation"

type Params = Promise<{ id: string }>

export default async function EditEventTemplatePage(props: { params: Params }) {
  const params = await props.params
  const templateId = parseInt(params.id)
  const [template, categories] = await Promise.all([
    getEventTemplate(templateId),
    getEventCategories(),
  ])

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Event-Vorlage bearbeiten"
        description={template.name}
        backUrl="/events"
      />

      <div className="px-4 pt-4">
        <EventTemplateForm template={template} categories={categories} />
      </div>
    </div>
  )
}
