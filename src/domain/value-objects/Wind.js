const CARDINAL_DIRECTIONS = Object.freeze([
  "N",
  "NE",
  "L",
  "SE",
  "S",
  "SO",
  "O",
  "NO",
]);

export class Wind {
  /**
   * @param {number} speedKmh
   * @param {number} directionDegrees
   */
  constructor(speedKmh, directionDegrees) {
    if (typeof speedKmh !== "number" || Number.isNaN(speedKmh) || speedKmh < 0) {
      throw new RangeError(`Invalid wind speed: ${speedKmh}`);
    }
    if (typeof directionDegrees !== "number" || Number.isNaN(directionDegrees)) {
      throw new RangeError(`Invalid wind direction: ${directionDegrees}`);
    }

    /** @readonly */
    this.speedKmh = Math.round(speedKmh);

    /** @readonly */
    this.directionDegrees = ((directionDegrees % 360) + 360) % 360;

    Object.freeze(this);
  }

  /**
   * @returns {string}
   */
  get cardinalDirection() {
    const sectorIndex = Math.round(this.directionDegrees / 45) % CARDINAL_DIRECTIONS.length;
    return CARDINAL_DIRECTIONS[sectorIndex];
  }
}
