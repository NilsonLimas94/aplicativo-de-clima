/**
 * @typedef {"C" | "F"} TemperatureUnit
 */

const ABSOLUTE_ZERO_CELSIUS = -273.15;

export class Temperature {
  /**
   * @param {number} celsius
   */
  constructor(celsius) {
    if (typeof celsius !== "number" || Number.isNaN(celsius) || celsius < ABSOLUTE_ZERO_CELSIUS) {
      throw new RangeError(`Invalid temperature in Celsius: ${celsius}`);
    }

    /** @readonly */
    this.celsius = celsius;
    Object.freeze(this);
  }

  /**
   * @param {number} celsius
   * @returns {Temperature}
   */
  static fromCelsius(celsius) {
    return new Temperature(celsius);
  }

  /**
   * @param {TemperatureUnit} unit
   * @returns {number}
   */
  inUnit(unit) {
    if (unit === "F") {
      return (this.celsius * 9) / 5 + 32;
    }
    return this.celsius;
  }

  /**
   * @param {TemperatureUnit} unit
   * @returns {number}
   */
  roundedIn(unit) {
    return Math.round(this.inUnit(unit));
  }

  /**
   * Diferença térmica absoluta em graus Celsius em relação a outra temperatura.
   * @param {Temperature} other
   * @returns {number}
   */
  deltaCelsiusFrom(other) {
    return this.celsius - other.celsius;
  }
}
