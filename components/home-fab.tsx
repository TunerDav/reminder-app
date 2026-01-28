"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { QuickActivityDialog } from "./quick-activity-dialog"

export function HomeFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95"
        aria-label="Aktivität erfassen"
      >
        <Plus className="h-6 w-6" />
      </button>
      <QuickActivityDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
