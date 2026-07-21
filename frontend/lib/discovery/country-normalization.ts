const ISO_COUNTRY_CODES = new Set("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" "));

const aliasToCode: Record<string, string> = {
  "britain": "GB", "great britain": "GB", "britain uk": "GB", "united kingdom": "GB", "uk": "GB",
  "united states": "US", "united states of america": "US", "usa": "US", "u s a": "US",
  "korea south": "KR", "south korea": "KR", "republic of korea": "KR",
  "turkey": "TR", "turkiye": "TR", "türkiye": "TR",
  "czech republic": "CZ", "czechia": "CZ",
  "uae": "AE", "united arab emirates": "AE",
  "vietnam": "VN", "viet nam": "VN",
  "russia": "RU", "russian federation": "RU",
  "taiwan": "TW", "taiwan province of china": "TW",
};

const canonicalOverrides: Record<string, string> = { GB: "United Kingdom", KR: "South Korea", TR: "Türkiye", US: "United States" };
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const nameToCode = new Map<string, string>();

for (const code of ISO_COUNTRY_CODES) {
  const name = canonicalOverrides[code] ?? displayNames.of(code);
  if (name) nameToCode.set(normalize(name), code);
}
for (const [alias, code] of Object.entries(aliasToCode)) nameToCode.set(normalize(alias), code);

/** Complete alphabetical ISO country/territory registry for user-controlled search. */
export const canonicalCountryOptions = [...ISO_COUNTRY_CODES]
  .map(code => canonicalOverrides[code] ?? displayNames.of(code))
  .filter((name): name is string => Boolean(name))
  .sort((left, right) => left.localeCompare(right, "en"));

/** Returns a country only when the supplied evidence explicitly identifies one. */
export function canonicalCountry(value: string | undefined | null) {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  const upper = candidate.toUpperCase();
  const code = ISO_COUNTRY_CODES.has(upper) ? upper : nameToCode.get(normalize(candidate));
  if (!code) return undefined;
  return canonicalOverrides[code] ?? displayNames.of(code) ?? undefined;
}

/**
 * Extracts a country only from explicit, delimited location evidence. City and
 * region names are never mapped to countries, so an uncertain value stays
 * unknown. Examples accepted: "Berlin, Germany" and "Remote (United Kingdom)".
 */
export function countryFromExplicitLocation(value: string | undefined | null) {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  const direct = canonicalCountry(candidate);
  if (direct) return direct;
  const segments = candidate
    .replace(/[()\[\]]/g, "|")
    .split(/[,;|/]|\s+[–—-]\s+/)
    .map(segment => segment.trim())
    .filter(Boolean);
  for (const segment of segments) {
    const country = canonicalCountry(segment);
    if (country) return country;
  }
  return undefined;
}
