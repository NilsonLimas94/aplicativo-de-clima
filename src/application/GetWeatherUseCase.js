/**
 * @typedef {Object} WeatherRepositoryPort
 * @property {() => Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot>} getDefault
 * @property {(query: string) => Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot | null>} findByQuery
 * @property {(latitude: number, longitude: number) => Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot>} findByCoordinates
 */

export class GetWeatherUseCase {
  /**
   * @param {WeatherRepositoryPort} weatherRepository
   */
  constructor(weatherRepository) {
    this.#weatherRepository = weatherRepository;
  }

  /** @type {WeatherRepositoryPort} */
  #weatherRepository;

  /**
   * @returns {Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot>}
   */
  executeDefault() {
    return this.#weatherRepository.getDefault();
  }

  /**
   * @param {string} query
   * @returns {Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot | null>}
   */
  executeByQuery(query) {
    const normalized = query.trim();
    if (!normalized) {
      return this.#weatherRepository.getDefault();
    }
    return this.#weatherRepository.findByQuery(normalized);
  }

  /**
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot>}
   */
  executeByCoordinates(latitude, longitude) {
    return this.#weatherRepository.findByCoordinates(latitude, longitude);
  }
}
