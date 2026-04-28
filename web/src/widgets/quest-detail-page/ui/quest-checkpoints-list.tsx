"use client";

import { CheckCircle2, Lock, MapPin } from "lucide-react";

import type { QuestPoint } from "@/entities/quest";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { cn } from "@/shared/lib/classnames";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type QuestCheckpointsListProps = {
  points: QuestPoint[];
  currentStepIndex?: number;
  hasActiveRun?: boolean;
};

export function QuestCheckpointsList({
  points,
  currentStepIndex,
  hasActiveRun,
}: QuestCheckpointsListProps) {
  const { t } = useTranslations();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">
          {t("questDetail.checkpointsHeading")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {hasActiveRun
            ? t("questDetail.checkpointsHintActive")
            : t("questDetail.checkpointsHintLocked")}
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {points.map((point, index) => {
            const locked =
              !hasActiveRun ||
              (currentStepIndex !== undefined && index > currentStepIndex);
            const passed =
              hasActiveRun &&
              currentStepIndex !== undefined &&
              index < currentStepIndex;
            const current =
              hasActiveRun &&
              currentStepIndex !== undefined &&
              index === currentStepIndex;

            return (
              <li
                key={point.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3",
                  current && "border-primary/40 bg-primary/5",
                  passed && "border-border bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    current && "bg-primary text-primary-foreground",
                    passed && "bg-muted text-muted-foreground",
                    !current && !passed && "bg-secondary text-secondary-foreground",
                  )}
                >
                  {passed ? (
                    <CheckCircle2 className="size-4" aria-hidden />
                  ) : locked && !current ? (
                    <Lock className="size-3.5" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">
                    {locked && !current
                      ? t("questDetail.checkpointLocked", { index: index + 1 })
                      : point.title}
                  </p>
                  {!locked || current ? (
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      <span className="font-mono tabular-nums tracking-tight">
                        {point.latitude.toFixed(4)}°, {point.longitude.toFixed(4)}°
                      </span>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
