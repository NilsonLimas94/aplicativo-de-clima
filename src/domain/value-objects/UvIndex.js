/**
 * @typedef {"low" | "moderate" | "high" | "very-high" | "extreme"} UvRiskLevel
 */

const UV_SCALE_MAX = 11;

export class UvIndex {
  /**
   * @param {number} value
   * @param {number} [dailyMax]
   */
  constructor(value, dailyMax = value) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new RangeError(`Invalid UV index: ${value}`);
    }
    if (typeof dailyMax !== "number" || Number.isNaN(dailyMax) || dailyMax < 0) {
      throw new RangeError(`Invalid daily max UV index: ${dailyMax}`);
    }

    /** @readonly */
    this.value = Math.round(value);

    /** @readonly */
    this.dailyMax = Math.round(Math.max(dailyMax, value));

    /** @readonly @type {UvRiskLevel} */
    this.riskLevel = UvIndex.#classify(this.value);

    /** @readonly */
    this.ratio = Math.min(this.value / UV_SCALE_MAX, 1);

    Object.freeze(this);
  }

  /**
   * @param {number} value
   * @returns {UvRiskLevel}
   */
  static #classify(value) {
    if (value <= 2) return "low";
    if (value <= 5) return "moderate";
    if (value <= 7) return "high";
    if (value <= 10) return "very-high";
    return "extreme";
  }
}
