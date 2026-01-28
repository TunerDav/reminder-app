import { BottomNav } from "@/components/bottom-nav"
import { ReminderCard } from "@/components/reminder-card"
import { EmptyState } from "@/components/empty-state"
import { Bell, Users, Heart, Calendar, ArrowRight, Sparkles, CalendarClock, Cake, UserX } from "lucide-react"
import Link from "next/link"
import { getUpcomingSlots, getUpcomingBirthdays, getNeglectedContacts, getOverdueReminders, getUpcomingReminders, getStats, getInviteGroupsWithScores } from "@/app/actions"
import { EventSlotCard } from "@/components/event-slot-card"
import { HomeFab } from "@/components/home-fab"
import { RelationshipScoreBadge } from "@/components/relationship-score-badge"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [overdueReminders, upcomingReminders, stats, upcomingSlots, birthdays, neglectedContacts, inviteGroupScores] = await Promise.all([
    getOverdueReminders(),
    getUpcomingReminders(),
    getStats(),
    getUpcomingSlots(3),
    getUpcomingBirthdays(14),
    getNeglectedContacts(4),
    getInviteGroupsWithScores(),
  ])

  const needsAttention = inviteGroupScores
    .filter(g => g.score.score < 50)
    .sort((a, b) => a.score.score - b.score.score)
    .slice(0, 5)

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground px-4 pt-12 pb-8 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium text-primary-foreground/80">RemindMe</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Guten Tag!</h1>
          <p className="text-primary-foreground/80 text-sm">
            Pflege deine Beziehungen und vergiss keine wichtigen Termine.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.contacts}</p>
              <p className="text-xs text-primary-foreground/80">Menschen</p>
            </div>
            <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Bell className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.reminders}</p>
              <p className="text-xs text-primary-foreground/80">Offen</p>
            </div>
            <div className={`bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center ${stats.overdue > 0 ? "ring-2 ring-destructive/50" : ""}`}>
              <Heart className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary-foreground">{stats.overdue}</p>
              <p className="text-xs text-primary-foreground/80">Überfällig</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Overdue Reminders - Priority */}
        {overdueReminders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Überfällig
              </h2>
              <Link
                href="/reminders"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Alle <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Birthdays */}
        {birthdays.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Cake className="h-5 w-5 text-chart-3" />
                Anstehende Geburtstage
              </h2>
            </div>
            <div className="space-y-2">
              {birthdays.map((birthday) => (
                <Link key={birthday.id} href={`/contacts/${birthday.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center text-chart-3 font-medium shrink-0">
                      {birthday.photo_url ? (
                        <img
                          src={birthday.photo_url}
                          alt={`${birthday.first_name} ${birthday.last_name}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        `${birthday.first_name[0]}${birthday.last_name[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {birthday.first_name} {birthday.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(birthday.birthday).toLocaleDateString("de-DE", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      birthday.days_until === 0
                        ? "bg-chart-3 text-white"
                        : birthday.days_until === 1
                          ? "bg-chart-3/20 text-chart-3"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {birthday.days_until === 0
                        ? "Heute!"
                        : birthday.days_until === 1
                          ? "Morgen"
                          : `in ${birthday.days_until} Tagen`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Event Slots */}
        {upcomingSlots.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                Nächste Termine
              </h2>
              <Link
                href="/events"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Alle <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingSlots.map((slot) => (
                <Link key={slot.id} href="/events">
                  <EventSlotCard slot={slot} showActions={false} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Reminders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Anstehend
            </h2>
            <Link
              href="/reminders"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-6 w-6 text-muted-foreground" />}
              title="Keine anstehenden Erinnerungen"
              description="Erstelle eine Erinnerung um nichts zu vergessen"
              action={
                <Link href="/reminders/new" className="text-sm text-primary font-medium hover:underline">
                  Erinnerung erstellen
                </Link>
              }
            />
          )}
        </section>

        {/* Needs Attention - Invite Groups with low scores */}
        {needsAttention.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserX className="h-5 w-5 text-chart-5" />
                Braucht Aufmerksamkeit
              </h2>
              <Link
                href="/invite-groups"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Alle <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {needsAttention.map((group) => (
                <Link key={group.id} href="/invite-groups">
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                    <div className="flex -space-x-2 shrink-0">
                      {group.members.slice(0, 2).map((m, i) => (
                        <div
                          key={m.id}
                          className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-5/20 to-chart-5/10 flex items-center justify-center text-chart-5 font-medium border-2 border-card text-xs"
                          style={{ zIndex: 2 - i }}
                        >
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {group.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {group.score.label}
                      </p>
                    </div>
                    <RelationshipScoreBadge score={group.score} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <HomeFab />
      <BottomNav />
    </div>
  )
}
