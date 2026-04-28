"use client";

import { useEffect, useState } from "react";
import { Loader2, Rocket } from "lucide-react";

import { useTranslations } from "@/shared/i18n/i18n-provider";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

type TeamCountdownCardProps = {
  startsAt: string | null;
};

export function TeamCountdownCard({ startsAt }: TeamCountdownCardProps) {
  const { t } = useTranslations();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const startsAtMs = startsAt ? new Date(startsAt).getTime() : null;
  const remainingSec =
    startsAtMs && now !== null
      ? Math.max(0, Math.ceil((startsAtMs - now) / 1000))
      : null;

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <Badge variant="default">
          <Rocket className="size-3" aria-hidden />
          {t("teamRun.startingBadge")}
        </Badge>
        <p className="text-5xl font-semibold tabular-nums">
          {remainingSec === null ? "…" : remainingSec}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("teamRun.startingDescription")}
        </p>
        <Loader2
          className="size-5 animate-spin text-muted-foreground"
          aria-hidden
        />
      </CardContent>
    </Card>
  );
}
