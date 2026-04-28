"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { teamQuestRunService } from "../api/team-quest-run-service";
import { ApiError } from "@/shared/api";
import { queryKeys } from "@/shared/lib/react-query/query-keys";
import { useAuthStore } from "@/shared/store/auth-store";
import type {
  TeamQuestRunCheckpointAnswer,
  TeamQuestRunProgress,
} from "@/entities/team-quest-run";

const FAST_POLL_MS = 1500;
const SLOW_POLL_MS = 8000;

export function useActiveTeamQuestRun(options?: { poll?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const poll = options?.poll ?? false;

  return useQuery<TeamQuestRunProgress | null, ApiError>({
    queryKey: queryKeys.teamQuestRun.active(),
    queryFn: async () => {
      try {
        return await teamQuestRunService.getActive();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000,
    refetchInterval: (query) => {
      if (!poll) return false;
      const data = query.state.data;
      if (!data) return SLOW_POLL_MS;
      if (data.status === "completed") return false;
      if (data.status === "in_progress") return SLOW_POLL_MS;
      return FAST_POLL_MS;
    },
    refetchIntervalInBackground: false,
  });
}

export function useSetTeamReadiness() {
  const queryClient = useQueryClient();
  return useMutation<
    TeamQuestRunProgress,
    ApiError,
    { questId: number; isReady: boolean }
  >({
    mutationFn: ({ questId, isReady }) =>
      teamQuestRunService.setReadiness({ questId, isReady }),
    onSuccess: (progress) => {
      queryClient.setQueryData(queryKeys.teamQuestRun.active(), progress);
    },
  });
}

export function useSubmitTeamCheckpointAnswer() {
  const queryClient = useQueryClient();
  return useMutation<
    TeamQuestRunCheckpointAnswer,
    ApiError,
    { checkpointId: number; answer: string }
  >({
    mutationFn: ({ checkpointId, answer }) =>
      teamQuestRunService.submitCheckpointAnswer({ checkpointId, answer }),
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.teamQuestRun.active(),
        result.progress,
      );
      if (result.progress.status === "completed") {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.me() });
        queryClient.invalidateQueries({
          queryKey: queryKeys.questRun.history(),
        });
      }
    },
  });
}
