import { CountryCode } from "./locations";

const ZIP_REGEX: Record<CountryCode, RegExp> = {
  LT: /^\d{5}$/,
  LV: /^LV-\d{4}$|^\d{4}$/,
  EE: /^\d{5}$/,

  PL: /^\d{2}-\d{3}$/,
  DE: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
  BE: /^\d{4}$/,
  FR: /^\d{5}$/,

  ES: /^\d{5}$/,
  IT: /^\d{5}$/,
  PT: /^\d{4}-\d{3}$/,

  SE: /^\d{3}\s?\d{2}$/,
  FI: /^\d{5}$/,
  DK: /^\d{4}$/,
  NO: /^\d{4}$/,

  IE: /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i,
  GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,

  CZ: /^\d{3}\s?\d{2}$/,
  AT: /^\d{4}$/,
  CH: /^\d{4}$/,
};

export function validateZip(country: CountryCode | "", zip: string) {
  const z = (zip ?? "").trim();

  if (!country) return { ok: false, message: "Pasirinkite šalį." };
  if (!z) return { ok: false, message: "Pašto kodas privalomas." };

  const re = ZIP_REGEX[country as CountryCode];
  if (!re.test(z)) return { ok: false, message: "Neteisingas pašto kodo formatas." };

  return { ok: true, message: "" };
}