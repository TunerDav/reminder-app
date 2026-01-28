"use client"

import type React from "react"
import { useState } from "react"
import { Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCongregation } from "@/app/actions"
import type { Congregation } from "@/lib/db"

interface CongregationManagerProps {
  initialCongregations: Congregation[]
}

export function CongregationManager({ initialCongregations }: CongregationManagerProps) {
  const [congregations, setCongregations] = useState(initialCongregations)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const city = formData.get("city") as string

    try {
      await createCongregation({ name, city })
      setCongregations((prev) => [...prev, { id: Date.now(), name, city, created_at: new Date() }])
      setShowForm(false)
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error creating congregation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {congregations.length === 0 && !showForm && (
        <div className="text-center py-6 bg-card rounded-2xl border border-border">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Versammlungen</p>
        </div>
      )}

      {congregations.map((cong) => (
        <div key={cong.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-card-foreground">{cong.name}</p>
            {cong.city && <p className="text-sm text-muted-foreground">{cong.city}</p>}
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="p-4 bg-card rounded-2xl border border-border space-y-3 shadow-sm">
          <Input name="name" placeholder="Name der Versammlung" required className="rounded-xl" />
          <Input name="city" placeholder="Stadt (optional)" className="rounded-xl" />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "..." : "Speichern"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full rounded-xl border-dashed h-11 hover:bg-primary/5 hover:border-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          Versammlung hinzufügen
        </Button>
      )}
    </div>
  )
}
