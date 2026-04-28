"use client";

import { QuestCard } from "./quest-card";
import type { Quest } from "@/entities/quest";

type QuestCardListProps = {
  quests: Quest[];
  showStatus?: boolean;
};

export function QuestCardList({ quests, showStatus }: QuestCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:items-stretch">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} showStatus={showStatus} />
      ))}
    </div>
  );
}
