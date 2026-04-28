"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

import {
  getAchievementImageUrl,
  type Achievement,
} from "@/entities/achievement";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { cn } from "@/shared/lib/classnames";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import { useMyAchievements } from "../model/use-achievements";

const PREVIEW_LIMIT = 4;

type AchievementsPreviewProps = {
  className?: string;
};

export function AchievementsPreview({ className }: AchievementsPreviewProps) {
  const { t } = useTranslations();
  const { data, isLoading } = useMyAchievements();

  const unlocked = data.filter((item) => item.unlocked);
  const items = unlocked.slice(0, PREVIEW_LIMIT);

  return (
    <Card className={cn("border-0 shadow-md", className)}>
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {t("profile.achievementsHeading")}
          </p>
          <Link
            href="/profile/achievements"
            className="inline-flex items-center gap-0.5 rounded-xl px-2 py-1 text-xs font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {t("common.show")}
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("profile.achievementsEmpty")}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((item) => (
              <PreviewTile key={item.id} achievement={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewTile({ achievement }: { achievement: Achievement }) {
  const imageUrl = getAchievementImageUrl(achievement);

  return (
    <li className="flex items-center gap-2 rounded-xl bg-muted/40 p-2">
      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={achievement.title}
            fill
            sizes="32px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <Trophy className="size-4" aria-hidden />
        )}
      </div>
      <p className="min-w-0 truncate text-xs font-medium">
        {achievement.title}
      </p>
    </li>
  );
}
