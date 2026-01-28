import { PageHeader } from "@/components/page-header"
import { BottomNav } from "@/components/bottom-nav"
import { InviteGroupForm } from "@/components/invite-group-form"
import { getContactsWithTags, getFamilies, getInviteGroupById } from "@/app/actions"

export const dynamic = 'force-dynamic'

export default async function NewInviteGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; familyId?: string }>
}) {
  const params = await searchParams
  const editId = params.edit ? parseInt(params.edit) : null
  const preselectedFamilyId = params.familyId ? parseInt(params.familyId) : null

  const [contacts, families, existingGroup] = await Promise.all([
    getContactsWithTags(),
    getFamilies(),
    editId ? getInviteGroupById(editId) : null,
  ])

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title={editId ? "Gruppe bearbeiten" : "Neue Einladungsgruppe"} />
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <InviteGroupForm
          contacts={contacts}
          families={families}
          existingGroup={existingGroup}
          preselectedFamilyId={preselectedFamilyId}
        />
      </div>
      <BottomNav />
    </div>
  )
}
