"use client";

import Image from "next/image";

import { getQuestCoverImageUrl, type QuestDetail } from "@/entities/quest";
import { useTranslations } from "@/shared/i18n/i18n-provider";

type QuestDetailCoverProps = {
  quest: QuestDetail;
};

export function QuestDetailCover({ quest }: QuestDetailCoverProps) {
  const { t } = useTranslations();
  const src = getQuestCoverImageUrl(quest);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
      <Image
        src={src}
        alt={quest.title || t("quest.defaultLocation")}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover"
        unoptimized
        priority
      />
    </div>
  );
}
