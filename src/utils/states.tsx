/**
 * Address helpers — state list lives in `./state`.
 */
export {
  INDIA_STATES,
  isIndiaState,
  type IndiaState,
} from "./state";

export const DEFAULT_COUNTRY_CODE = "IN" as const;
export const DEFAULT_COUNTRY_LABEL = "India";

export function formatCountryLabel(countryCode: string): string {
  if (countryCode === DEFAULT_COUNTRY_CODE || countryCode.toUpperCase() === "INDIA") {
    return DEFAULT_COUNTRY_LABEL;
  }
  return countryCode;
}
