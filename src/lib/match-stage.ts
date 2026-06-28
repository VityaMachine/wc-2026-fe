import type { Locale } from "@/types/locale";

const PLAYOFF_STAGE_BY_NORMALIZED_VALUE = {
  ROUND_OF_32: "ROUND_OF_32",
  ROUNDOF32: "ROUND_OF_32",
  ROUND_OF_16: "ROUND_OF_16",
  ROUNDOF16: "ROUND_OF_16",
  QUARTER_FINAL: "QUARTER_FINAL",
  QUARTER_FINALS: "QUARTER_FINAL",
  QUARTERFINALS: "QUARTER_FINAL",
  QUARTERFINAL: "QUARTER_FINAL",
  SEMI_FINAL: "SEMI_FINAL",
  SEMI_FINALS: "SEMI_FINAL",
  SEMIFINALS: "SEMI_FINAL",
  SEMIFINAL: "SEMI_FINAL",
  THIRD_PLACE: "THIRD_PLACE",
  THIRD_PLACE_MATCH: "THIRD_PLACE",
  THIRDPLACEMATCH: "THIRD_PLACE",
  FINAL: "FINAL",
} as const;

export type PlayoffStage = (typeof PLAYOFF_STAGE_BY_NORMALIZED_VALUE)[keyof typeof PLAYOFF_STAGE_BY_NORMALIZED_VALUE];

export const PLAYOFF_STAGE_ORDER: PlayoffStage[] = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

const STAGE_LABELS: Record<PlayoffStage | "GROUP", Record<Locale, string>> = {
  GROUP: {
    uk: "Груповий етап",
    en: "Group stage",
  },
  ROUND_OF_32: {
    uk: "1/16 фіналу",
    en: "Round of 32",
  },
  ROUND_OF_16: {
    uk: "1/8 фіналу",
    en: "Round of 16",
  },
  QUARTER_FINAL: {
    uk: "Чвертьфінали",
    en: "Quarter-finals",
  },
  SEMI_FINAL: {
    uk: "Півфінали",
    en: "Semi-finals",
  },
  THIRD_PLACE: {
    uk: "Матч за 3 місце",
    en: "Third-place match",
  },
  FINAL: {
    uk: "Фінал",
    en: "Final",
  },
};

function normalizeStageValue(stage?: string | null) {
  return (stage ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s*-\s*\d+$/, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getPlayoffStage(stage?: string | null): PlayoffStage | null {
  const normalizedStage = normalizeStageValue(stage);

  if (!normalizedStage || normalizedStage === "GROUP" || normalizedStage.startsWith("GROUP_STAGE")) {
    return null;
  }

  return PLAYOFF_STAGE_BY_NORMALIZED_VALUE[
    normalizedStage as keyof typeof PLAYOFF_STAGE_BY_NORMALIZED_VALUE
  ] ?? null;
}

export function formatMatchStage(stage?: string | null, locale: Locale = "uk") {
  const playoffStage = getPlayoffStage(stage);

  if (playoffStage) {
    return STAGE_LABELS[playoffStage][locale];
  }

  const normalizedStage = normalizeStageValue(stage);

  if (normalizedStage === "GROUP" || normalizedStage.startsWith("GROUP_STAGE")) {
    return STAGE_LABELS.GROUP[locale];
  }

  return stage?.trim() || "N/A";
}
