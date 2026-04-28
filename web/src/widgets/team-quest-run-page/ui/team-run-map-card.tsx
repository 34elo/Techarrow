"use client";

import { useMemo } from "react";

import {
  getDefaultMapCenter,
  questCoordinates,
  type QuestDetail,
} from "@/entities/quest";
import type { TeamQuestRunProgress } from "@/entities/team-quest-run";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { useGeolocation } from "@/shared/lib/geolocation";
import { Card, CardContent } from "@/shared/ui/card";
import { MapView, type MapMarkerData } from "@/shared/ui/map";

type TeamRunMapCardProps = {
  run: TeamQuestRunProgress;
  quest: QuestDetail;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function TeamRunMapCard({ run, quest }: TeamRunMapCardProps) {
  const { t } = useTranslations();
  const { coords: userCoords } = useGeolocation({ watch: true, auto: true });

  const markers = useMemo<MapMarkerData[]>(
    () =>
      run.checkpoints.map((cp, index) => ({
        id: `team-${cp.id}`,
        lat: cp.latitude,
        lng: cp.longitude,
        variant: cp.is_completed ? "passed" : "active",
        label: String(index + 1),
        popupHtml: `<div style="font-weight:600">${index + 1}. ${escapeHtml(cp.title)}</div>`,
      })),
    [run.checkpoints],
  );

  const center = useMemo(() => {
    const firstOpen = run.checkpoints.find((cp) => !cp.is_completed);
    if (firstOpen) {
      return { lat: firstOpen.latitude, lng: firstOpen.longitude };
    }
    if (
      typeof quest.latitude === "number" &&
      typeof quest.longitude === "number"
    ) {
      return questCoordinates(quest);
    }
    return getDefaultMapCenter();
  }, [run.checkpoints, quest]);

  return (
    <Card className="flex h-full flex-col border-0 shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("teamRun.mapHeading")}
        </p>
        <div className="min-h-72 flex-1 overflow-hidden rounded-2xl">
          <MapView
            center={center}
            zoom={14}
            markers={markers}
            userLocation={userCoords}
          />
        </div>
      </CardContent>
    </Card>
  );
}
