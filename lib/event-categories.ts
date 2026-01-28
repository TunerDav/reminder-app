export const DEFAULT_EVENT_CATEGORIES: { value: string; label: string }[] = [
  { value: "jw-broadcasting", label: "JW Broadcasting" },
  { value: "field-service", label: "Predigtdienst" },
  { value: "group-meeting", label: "Gruppentreffpunkt" },
  { value: "bible-study", label: "Bibelstudium" },
]

export function getCategoryLabel(value: string): string {
  const found = DEFAULT_EVENT_CATEGORIES.find((c) => c.value === value)
  return found ? found.label : value
}
