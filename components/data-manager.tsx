"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Upload } from "lucide-react"
import { exportAllData } from "@/app/actions"
import { toast } from "sonner"
import { useState } from "react"

export function DataManager() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportAllData()
      if (!data) {
        toast.error("Export fehlgeschlagen")
        return
      }

      // Create JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `remindme-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Daten erfolgreich exportiert")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Fehler beim Exportieren")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const data = await exportAllData()
      if (!data || !data.contacts) {
        toast.error("Export fehlgeschlagen")
        return
      }

      // Create CSV for contacts
      const headers = [
        "Vorname",
        "Nachname",
        "Telefon",
        "E-Mail",
        "Adresse",
        "Geburtstag",
        "Hochzeitstag",
        "Notizen",
      ]
      const rows = data.contacts.map((contact: any) => [
        contact.first_name,
        contact.last_name,
        contact.phone || "",
        contact.email || "",
        contact.address || "",
        contact.birthday || "",
        contact.wedding_anniversary || "",
        contact.notes || "",
      ])

      const csv = [
        headers.join(","),
        ...rows.map((row: any[]) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `remindme-kontakte-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Kontakte als CSV exportiert")
    } catch (error) {
      console.error("CSV export error:", error)
      toast.error("Fehler beim CSV-Export")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Daten-Verwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Exportiere oder importiere deine Daten
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            JSON Export
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            JSON Export enthält alle Daten (Kontakte, Erinnerungen, Tags, etc.)
          </p>
          <p className="text-xs text-muted-foreground">
            CSV Export enthält nur Kontakte (für Excel/Google Sheets)
          </p>
        </div>
      </div>
    </Card>
  )
}
