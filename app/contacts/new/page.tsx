import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ family_id?: string }>
}

export default async function NewContactPage({ searchParams }: PageProps) {
  const params = await searchParams
  // Validate that family_id is a valid number, not "new" or other string
  const familyIdStr = params.family_id
  const defaultFamilyId = familyIdStr && !isNaN(Number(familyIdStr)) ? parseInt(familyIdStr) : undefined

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Neuer Kontakt" showBack />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <ContactForm defaultFamilyId={defaultFamilyId} />
      </div>
      <BottomNav />
    </div>
  )
}
