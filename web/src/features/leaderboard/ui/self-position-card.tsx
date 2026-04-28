"use client";

import type { LeaderboardSelfPosition } from "@/entities/leaderboard";
import type { Team } from "@/entities/team";
import { useTranslations } from "@/shared/i18n/i18n-provider";

type SelfPositionCardProps = {
  scope: "users" | "teams";
  self: LeaderboardSelfPosition | null;
  team: Team | null;
};

export function SelfPositionCard({ scope, self, team }: SelfPositionCardProps) {
  const { t } = useTranslations();

  if (scope === "teams" && !team) {
    return (
      <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        {t("leaderboard.noTeamYet")}
      </p>
    );
  }

  if (!self) {
    return null;
  }

  const heading =
    scope === "teams"
      ? (team?.name ?? t("leaderboard.myTeamLabel"))
      : t("leaderboard.myPlace");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
      <div className="min-w-0 truncate">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {scope === "teams"
            ? t("leaderboard.myTeamLabel")
            : t("leaderboard.myPlace")}
        </span>
        <span className="ml-2 font-semibold">{heading}</span>
      </div>
      <div className="flex items-center gap-4 tabular-nums">
        <span>
          <span className="text-xs text-muted-foreground">
            {t("leaderboard.myPlace")}
          </span>{" "}
          <span className="font-semibold">#{self.rank}</span>
        </span>
        <span>
          <span className="text-xs text-muted-foreground">
            {t("leaderboard.myScore")}
          </span>{" "}
          <span className="font-semibold">{self.score.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}
