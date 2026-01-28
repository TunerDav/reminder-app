"use client"

import type { ScoreResult } from "@/lib/db"
import { cn } from "@/lib/utils"

interface RelationshipScoreBadgeProps {
  score: ScoreResult
  size?: "sm" | "lg"
}

function getScoreBg(score: number) {
  if (score >= 75) return "bg-green-500/10"
  if (score >= 50) return "bg-blue-500/10"
  if (score >= 25) return "bg-yellow-500/10"
  if (score > 0) return "bg-red-500/10"
  return "bg-muted"
}

function getScoreRing(score: number) {
  if (score >= 75) return "ring-green-500/30"
  if (score >= 50) return "ring-blue-500/30"
  if (score >= 25) return "ring-yellow-500/30"
  if (score > 0) return "ring-red-500/30"
  return ""
}

export function RelationshipScoreBadge({ score, size = "sm" }: RelationshipScoreBadgeProps) {
  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-xs font-bold ring-1",
          getScoreBg(score.score),
          getScoreRing(score.score),
          score.color,
        )}
      >
        {score.score}
      </span>
    )
  }

  return (
    <div className={cn("rounded-2xl p-4 space-y-3", getScoreBg(score.score))}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn("text-sm font-semibold", score.color)}>{score.label}</p>
          <p className="text-xs text-muted-foreground">Beziehungsscore</p>
        </div>
        <span className={cn("text-2xl font-bold", score.color)}>{score.score}</span>
      </div>
      <div className="space-y-1.5">
        <ScoreBar label="Aktualität" value={score.recency} />
        <ScoreBar label="Häufigkeit" value={score.frequency} />
        <ScoreBar label="Vielfalt" value={score.variety} />
      </div>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 75 ? "bg-green-500" :
            value >= 50 ? "bg-blue-500" :
            value >= 25 ? "bg-yellow-500" :
            value > 0 ? "bg-red-500" : "bg-muted-foreground/30",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
    </div>
  )
}
