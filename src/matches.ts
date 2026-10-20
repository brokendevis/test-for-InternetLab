export type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  minute?: number;
  home: { name: string };
  away: { name: string };
  score: { home: number; away: number } | null;
};

export type MatchesData = {
  round: number;
  matches: Match[];
};
