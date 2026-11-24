/**
 * @typedef {"before-sunrise" | "daytime" | "after-sunset"} SolarPhase
 */

export class SolarCycle {
  /**
   * @param {Date} sunrise
   * @param {Date} sunset
   * @param {Date} currentTime
   */
  constructor(sunrise, sunset, currentTime) {
    if (!(sunrise instanceof Date) || !(sunset instanceof Date) || !(currentTime instanceof Date)) {
      throw new TypeError("SolarCycle requires valid Date instances.");
    }
    if (sunset.getTime() <= sunrise.getTime()) {
      throw new RangeError("Sunset must occur after sunrise.");
    }

    /** @readonly */
    this.sunrise = new Date(sunrise.getTime());

    /** @readonly */
    this.sunset = new Date(sunset.getTime());

    /** @readonly */
    this.currentTime = new Date(currentTime.getTime());

    Object.freeze(this);
  }

  /**
   * Proporção do arco solar entre 0 (nascer do sol) e 1 (pôr do sol).
   * @returns {number}
   */
  get progress() {
    const daylightDuration = this.sunset.getTime() - this.sunrise.getTime();
    const elapsed = this.currentTime.getTime() - this.sunrise.getTime();
    return Math.min(Math.max(elapsed / daylightDuration, 0), 1);
  }

  /**
   * @returns {boolean}
   */
  get isDaytime() {
    return this.phase === "daytime";
  }

  /**
   * @returns {SolarPhase}
   */
  get phase() {
    const now = this.currentTime.getTime();
    if (now < this.sunrise.getTime()) return "before-sunrise";
    if (now > this.sunset.getTime()) return "after-sunset";
    return "daytime";
  }
}
