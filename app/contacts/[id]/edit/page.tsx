import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"
import { getContactById } from "@/app/actions"

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contact = await getContactById(parseInt(id))

  if (!contact) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kontakt bearbeiten" showBack />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <ContactForm contact={contact} />
      </div>
      <BottomNav />
    </div>
  )
}
