export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  isMine?: boolean;
};

export type LeaderboardSelfPosition = {
  rank: number;
  score: number;
  totalParticipants: number;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  self: LeaderboardSelfPosition | null;
};
