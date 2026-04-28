"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";
import { toast } from "sonner";

import { FavoriteButton } from "@/features/quest-favorites";
import {
  StartQuestDialog,
  runModeStorage,
  useActiveQuestRun,
  useStartQuestRun,
  type QuestMode,
} from "@/features/quest-run";
import { useMyTeam } from "@/features/teams";
import { useTranslations } from "@/shared/i18n/i18n-provider";
import { Button } from "@/shared/ui/button";

import { ComplaintDialog } from "./complaint-dialog";

type QuestDetailActionsProps = {
  questId: number;
  questTitle: string;
  isOwn: boolean;
};

export function QuestDetailActions({
  questId,
  questTitle,
  isOwn,
}: QuestDetailActionsProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: activeRun } = useActiveQuestRun();
  const { data: team } = useMyTeam();
  const startRun = useStartQuestRun();

  const [modeOpen, setModeOpen] = useState(false);

  const isActiveOnThisQuest =
    activeRun?.status === "in_progress" && activeRun.quest_id === questId;
  const hasOtherActiveRun =
    activeRun?.status === "in_progress" && activeRun.quest_id !== questId;

  const handleStartConfirm = (mode: QuestMode) => {
    if (isOwn) return;
    startRun.mutate(
      { questId },
      {
        onSuccess: (run) => {
          runModeStorage.set(run.run_id, mode);
          setModeOpen(false);
          toast.success(t("startQuest.startedToast"));
          router.push(`/quests/${questId}/run`);
        },
        onError: (error) => {
          toast.error(t("startQuest.startFailed"), {
            description: error.message || t("common.tryAgain"),
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isActiveOnThisQuest ? (
        <Button onClick={() => router.push(`/quests/${questId}/run`)}>
          {t("activeQuest.continue")}
          <ArrowRight />
        </Button>
      ) : (
        <Button
          onClick={() => setModeOpen(true)}
          disabled={startRun.isPending || isOwn || hasOtherActiveRun}
          title={
            isOwn
              ? t("startQuest.ownQuest")
              : hasOtherActiveRun
                ? t("startQuest.otherActive")
                : undefined
          }
        >
          <Play />
          {startRun.isPending ? t("startQuest.starting") : t("startQuest.start")}
        </Button>
      )}
      <FavoriteButton questId={questId} variant="text" />
      {!isOwn ? <ComplaintDialog questId={questId} /> : null}

      <StartQuestDialog
        open={modeOpen}
        onOpenChange={(value) => {
          if (!startRun.isPending) setModeOpen(value);
        }}
        questTitle={questTitle}
        hasTeam={Boolean(team)}
        isPending={startRun.isPending}
        onConfirm={handleStartConfirm}
      />
    </div>
  );
}
