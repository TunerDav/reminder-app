import { redirect } from "next/navigation"

export default function FamiliesPage() {
  redirect("/contacts?filter=families")
}
