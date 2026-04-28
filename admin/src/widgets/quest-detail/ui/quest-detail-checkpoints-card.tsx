"use client"

import { MapPin } from "lucide-react"

import type { QuestDetail } from "@/entities/quest"
import { useTranslations } from "@/shared/i18n/i18n-provider"
import { cn } from "@/shared/lib/classnames"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

type QuestDetailCheckpointsCardProps = {
  quest: QuestDetail
  className?: string
}

export function QuestDetailCheckpointsCard({
  quest,
  className,
}: QuestDetailCheckpointsCardProps) {
  const { t } = useTranslations()
  const points = quest.points ?? []

  return (
    <Card className={cn("flex h-full min-h-0 flex-col shadow-sm", className)}>
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">
          {t("questDetail.checkpointsHeading")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("questDetail.checkpointsCount")}: {points.length}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("questDetail.checkpointsEmpty")}
          </p>
        ) : (
          <ol className="space-y-3">
            {points.map((point, index) => (
              <li
                key={point.id}
                className="rounded-xl border border-border/60 bg-card p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-medium leading-snug">
                      {point.title}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      <span className="font-mono tabular-nums tracking-tight">
                        {point.latitude.toFixed(4)}°, {point.longitude.toFixed(4)}°
                      </span>
                    </p>
                    {point.task ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("questDetail.checkpointTask")}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {point.task}
                        </p>
                      </div>
                    ) : null}
                    {point.correct_answer ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("questDetail.checkpointAnswer")}
                        </p>
                        <p className="font-mono text-sm">{point.correct_answer}</p>
                      </div>
                    ) : null}
                    {point.hint ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("questDetail.checkpointHint")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {point.hint}
                        </p>
                      </div>
                    ) : null}
                    {point.point_rules ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("questDetail.checkpointRules")}
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {point.point_rules}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
