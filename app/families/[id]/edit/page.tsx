import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { FamilyForm } from "@/components/family-form"
import { getFamilyById } from "@/app/actions"

export default async function EditFamilyPage({ params }: { params: { id: string } }) {
  const familyId = parseInt(params.id)
  const family = await getFamilyById(familyId)

  if (!family) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Familie bearbeiten" showBack />
      
      <div className="px-4 py-2 max-w-lg mx-auto">
        <FamilyForm family={family} />
      </div>
    </div>
  )
}
