/**
 * @typedef {"clear" | "partly-cloudy" | "cloudy" | "rain" | "storm"} WeatherConditionCode
 * @typedef {"sunny" | "rainy" | "cloudy"} AtmosphericTheme
 */

/** @type {Record<WeatherConditionCode, AtmosphericTheme>} */
const CONDITION_THEME_MAP = Object.freeze({
  clear: "sunny",
  "partly-cloudy": "sunny",
  cloudy: "cloudy",
  rain: "rainy",
  storm: "rainy",
});

export class WeatherCondition {
  /**
   * @param {WeatherConditionCode} code
   */
  constructor(code) {
    if (!(code in CONDITION_THEME_MAP)) {
      throw new RangeError(`Unknown WeatherConditionCode: ${code}`);
    }

    /** @readonly */
    this.code = code;

    /** @readonly @type {AtmosphericTheme} */
    this.theme = CONDITION_THEME_MAP[code];

    Object.freeze(this);
  }

  /**
   * @param {WeatherConditionCode} code
   * @returns {WeatherCondition}
   */
  static of(code) {
    return new WeatherCondition(code);
  }
}
