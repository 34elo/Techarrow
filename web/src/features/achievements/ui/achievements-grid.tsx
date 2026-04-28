"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

import {
  getAchievementImageUrl,
  type Achievement,
} from "@/entities/achievement";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { cn } from "@/shared/lib/classnames";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type AchievementsGridProps = {
  achievements: Achievement[];
};

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const { t } = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.achievementsHeading")}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("profile.achievementsHint")}
        </p>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("profile.achievementsEmpty")}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {achievements.map((item) => (
              <AchievementTile key={item.id} achievement={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementTile({ achievement }: { achievement: Achievement }) {
  const { t } = useTranslations();
  const imageUrl = getAchievementImageUrl(achievement);

  return (
    <li
      className={cn(
        "flex gap-3 rounded-2xl border p-3 transition-colors",
        achievement.unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card opacity-70",
      )}
    >
      <AchievementMedia
        title={achievement.title}
        imageUrl={imageUrl}
        unlocked={achievement.unlocked}
      />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium leading-snug">{achievement.title}</p>
        <p className="text-xs text-muted-foreground">
          {achievement.description}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {achievement.unlocked
            ? t("profile.achievementUnlocked")
            : t("profile.achievementLocked")}
        </p>
      </div>
    </li>
  );
}

function AchievementMedia({
  title,
  imageUrl,
  unlocked,
}: {
  title: string;
  imageUrl: string | null;
  unlocked: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full",
        unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <Trophy className="size-5" aria-hidden />
      )}
    </div>
  );
}
