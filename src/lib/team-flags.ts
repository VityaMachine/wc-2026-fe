const FLAGS_BY_CODE: Record<string, string> = {
  AUS: "🇦🇺",
  BEL: "🇧🇪",
  BIH: "🇧🇦",
  BRA: "🇧🇷",
  CAN: "🇨🇦",
  CRC: "🇨🇷",
  CUW: "🇨🇼",
  CZE: "🇨🇿",
  ECU: "🇪🇨",
  EGY: "🇪🇬",
  ENG: "🏴",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  HAI: "🇭🇹",
  CIV: "🇨🇮",
  JPN: "🇯🇵",
  KOR: "🇰🇷",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NED: "🇳🇱",
  NLD: "🇳🇱",
  PAR: "🇵🇾",
  PRY: "🇵🇾",
  QAT: "🇶🇦",
  SCO: "🏴",
  SEN: "🇸🇳",
  RSA: "🇿🇦",
  KSA: "🇸🇦",
  SWE: "🇸🇪",
  SUI: "🇨🇭",
  CHE: "🇨🇭",
  TUN: "🇹🇳",
  TUR: "🇹🇷",
  USA: "🇺🇸",
};

const FLAGS_BY_NAME: Record<string, string> = {
  australia: "🇦🇺",
  belgium: "🇧🇪",
  "bosnia & herzegovina": "🇧🇦",
  "bosnia and herzegovina": "🇧🇦",
  brazil: "🇧🇷",
  canada: "🇨🇦",
  "costa rica": "🇨🇷",
  "czech republic": "🇨🇿",
  "curaçao": "🇨🇼",
  curacao: "🇨🇼",
  ecuador: "🇪🇨",
  egypt: "🇪🇬",
  england: "🏴",
  france: "🇫🇷",
  germany: "🇩🇪",
  haiti: "🇭🇹",
  "ivory coast": "🇨🇮",
  "côte d'ivoire": "🇨🇮",
  "cote d'ivoire": "🇨🇮",
  japan: "🇯🇵",
  mexico: "🇲🇽",
  morocco: "🇲🇦",
  netherlands: "🇳🇱",
  paraguay: "🇵🇾",
  qatar: "🇶🇦",
  scotland: "🏴",
  senegal: "🇸🇳",
  "south africa": "🇿🇦",
  "south korea": "🇰🇷",
  sweden: "🇸🇪",
  switzerland: "🇨🇭",
  tunisia: "🇹🇳",
  "türkiye": "🇹🇷",
  turkiye: "🇹🇷",
  turkey: "🇹🇷",
  usa: "🇺🇸",
  "united states": "🇺🇸",
};

export function getTeamFlag(teamCode?: string | null, teamName?: string | null): string {
  if (teamCode) {
    const flag = FLAGS_BY_CODE[teamCode.trim().toUpperCase()];

    if (flag) {
      return flag;
    }
  }

  if (teamName) {
    const flag = FLAGS_BY_NAME[teamName.trim().toLowerCase()];

    if (flag) {
      return flag;
    }
  }

  return "🏳️";
}
