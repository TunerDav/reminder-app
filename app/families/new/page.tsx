import { PageHeader } from "@/components/page-header"
import { FamilyForm } from "@/components/family-form"

export default function NewFamilyPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Familie erstellen" showBack />
      
      <div className="px-4 py-2 max-w-lg mx-auto">
        <FamilyForm />
      </div>
    </div>
  )
}
