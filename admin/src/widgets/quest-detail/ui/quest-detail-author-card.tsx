"use client"

import type { QuestDetail } from "@/entities/quest/model/quest-detail"
import { useTranslations } from "@/shared/i18n/i18n-provider"
import { cn } from "@/shared/lib/classnames"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

type QuestDetailAuthorCardProps = {
  quest: QuestDetail
  className?: string
}

function initialsFromUsername(username: string): string {
  const parts = username.trim().split(/[\s._-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return username.slice(0, 2).toUpperCase() || "?"
}

export function QuestDetailAuthorCard({ quest, className }: QuestDetailAuthorCardProps) {
  const { t } = useTranslations()
  const initials = initialsFromUsername(quest.creator.username)

  return (
    <Card className={cn("flex h-full min-h-0 flex-col shadow-sm", className)}>
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">{t("questDetail.creator")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold tracking-tight text-foreground ring-2 ring-border/80 sm:size-16 sm:text-lg"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("questDetail.username")}
              </p>
              <p className="truncate text-lg font-semibold leading-tight text-foreground">
                {quest.creator.username}
              </p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("questDetail.creatorId")}</p>
                <p className="font-mono text-foreground">{quest.creator.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-medium text-muted-foreground">{t("questDetail.teamName")}</p>
                <p className="truncate text-foreground">
                  {quest.creator.team_name ?? <span className="text-muted-foreground">—</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
