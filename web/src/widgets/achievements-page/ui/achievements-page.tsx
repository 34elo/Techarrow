"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AchievementsGrid, useMyAchievements } from "@/features/achievements";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function AchievementsPage() {
  const { t } = useTranslations();
  const achievements = useMyAchievements();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft />
            {t("common.back")}
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("profile.achievementsHeading")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("profile.achievementsHint")}
          </p>
        </div>
      </header>

      {achievements.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <AchievementsGrid achievements={achievements.data ?? []} />
      )}
    </div>
  );
}
