import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { FamilyDetail } from "@/components/family-detail"
import { getFamilyById, getFamilyMembers, getFamilyTags, getFamilyInteractions, getFamilyReminders, getInviteGroupsByFamily } from "@/app/actions"
import { getInviteGroupScore } from "@/app/actions"

export const dynamic = 'force-dynamic'

export default async function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const familyId = parseInt(id)

  const [family, tags, members, reminders, interactions, inviteGroupsRaw] = await Promise.all([
    getFamilyById(familyId),
    getFamilyTags(familyId),
    getFamilyMembers(familyId),
    getFamilyReminders(familyId),
    getFamilyInteractions(familyId),
    getInviteGroupsByFamily(familyId),
  ])

  // Compute scores for each invite group
  const inviteGroups = await Promise.all(
    inviteGroupsRaw.map(async (g) => ({
      ...g,
      score: await getInviteGroupScore(g.id),
    }))
  )

  if (!family) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title={family.name} showBack />

      <FamilyDetail
        family={family}
        tags={tags}
        members={members}
        reminders={reminders}
        interactions={interactions}
        inviteGroups={inviteGroups}
      />
    </div>
  )
}
