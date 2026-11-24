import { WeatherSnapshot } from "../../domain/entities/WeatherSnapshot.js";
import { Temperature } from "../../domain/value-objects/Temperature.js";
import { WeatherCondition } from "../../domain/value-objects/WeatherCondition.js";
import { Wind } from "../../domain/value-objects/Wind.js";
import { UvIndex } from "../../domain/value-objects/UvIndex.js";
import { SolarCycle } from "../../domain/value-objects/SolarCycle.js";

/**
 * Normaliza texto removendo acentos e espaços extras para busca insensível a diacríticos.
 * @param {string} value
 * @returns {string}
 */
function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Cria um snapshot in-memory de exemplo respeitando todas as regras de domínio.
 * @returns {WeatherSnapshot[]}
 */
function createSeedSnapshots() {
  const vitoria = new WeatherSnapshot({
    location: {
      id: "vitoria-es-br",
      city: "Vitória",
      region: "ES",
      country: "Brasil",
      timeZone: "America/Sao_Paulo",
      latitude: -20.3155,
      longitude: -40.3128,
    },
    observedAt: new Date("2026-11-24T12:15:00-03:00"),
    current: {
      temperature: Temperature.fromCelsius(28),
      feelsLike: Temperature.fromCelsius(30),
      humidity: 68,
      wind: new Wind(18, 45),
      uvIndex: new UvIndex(7, 9),
      condition: WeatherCondition.of("clear"),
    },
    hourlyForecast: [
      { time: new Date("2026-11-24T09:00:00-03:00"), temperature: Temperature.fromCelsius(26), condition: WeatherCondition.of("clear") },
      { time: new Date("2026-11-24T12:00:00-03:00"), temperature: Temperature.fromCelsius(28), condition: WeatherCondition.of("clear") },
      { time: new Date("2026-11-24T15:00:00-03:00"), temperature: Temperature.fromCelsius(29), condition: WeatherCondition.of("partly-cloudy") },
      { time: new Date("2026-11-24T18:00:00-03:00"), temperature: Temperature.fromCelsius(25), condition: WeatherCondition.of("partly-cloudy") },
      { time: new Date("2026-11-24T21:00:00-03:00"), temperature: Temperature.fromCelsius(23), condition: WeatherCondition.of("clear") },
    ],
    dailyForecast: [
      { date: new Date("2026-11-24T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(21), maxTemperature: Temperature.fromCelsius(29), condition: WeatherCondition.of("clear") },
      { date: new Date("2026-11-25T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(20), maxTemperature: Temperature.fromCelsius(27), condition: WeatherCondition.of("partly-cloudy") },
      { date: new Date("2026-11-26T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(19), maxTemperature: Temperature.fromCelsius(26), condition: WeatherCondition.of("cloudy") },
      { date: new Date("2026-11-27T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(21), maxTemperature: Temperature.fromCelsius(28), condition: WeatherCondition.of("clear") },
      { date: new Date("2026-11-28T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(20), maxTemperature: Temperature.fromCelsius(25), condition: WeatherCondition.of("rain") },
    ],
    solarCycle: new SolarCycle(
      new Date("2026-11-24T05:18:00-03:00"),
      new Date("2026-11-24T18:12:00-03:00"),
      new Date("2026-11-24T12:15:00-03:00")
    ),
  });

  const londres = new WeatherSnapshot({
    location: {
      id: "london-gb",
      city: "Londres",
      region: "ENG",
      country: "Reino Unido",
      timeZone: "Europe/London",
      latitude: 51.5072,
      longitude: -0.1276,
    },
    observedAt: new Date("2026-11-24T14:30:00Z"),
    current: {
      temperature: Temperature.fromCelsius(11),
      feelsLike: Temperature.fromCelsius(9),
      humidity: 86,
      wind: new Wind(24, 240),
      uvIndex: new UvIndex(1, 2),
      condition: WeatherCondition.of("rain"),
    },
    hourlyForecast: [
      { time: new Date("2026-11-24T12:00:00Z"), temperature: Temperature.fromCelsius(11), condition: WeatherCondition.of("rain") },
      { time: new Date("2026-11-24T15:00:00Z"), temperature: Temperature.fromCelsius(10), condition: WeatherCondition.of("rain") },
      { time: new Date("2026-11-24T18:00:00Z"), temperature: Temperature.fromCelsius(9), condition: WeatherCondition.of("cloudy") },
      { time: new Date("2026-11-24T21:00:00Z"), temperature: Temperature.fromCelsius(8), condition: WeatherCondition.of("cloudy") },
      { time: new Date("2026-11-25T00:00:00Z"), temperature: Temperature.fromCelsius(7), condition: WeatherCondition.of("rain") },
    ],
    dailyForecast: [
      { date: new Date("2026-11-24T12:00:00Z"), minTemperature: Temperature.fromCelsius(7), maxTemperature: Temperature.fromCelsius(12), condition: WeatherCondition.of("rain") },
      { date: new Date("2026-11-25T12:00:00Z"), minTemperature: Temperature.fromCelsius(6), maxTemperature: Temperature.fromCelsius(11), condition: WeatherCondition.of("cloudy") },
      { date: new Date("2026-11-26T12:00:00Z"), minTemperature: Temperature.fromCelsius(5), maxTemperature: Temperature.fromCelsius(10), condition: WeatherCondition.of("rain") },
      { date: new Date("2026-11-27T12:00:00Z"), minTemperature: Temperature.fromCelsius(4), maxTemperature: Temperature.fromCelsius(9), condition: WeatherCondition.of("partly-cloudy") },
      { date: new Date("2026-11-28T12:00:00Z"), minTemperature: Temperature.fromCelsius(6), maxTemperature: Temperature.fromCelsius(11), condition: WeatherCondition.of("cloudy") },
    ],
    solarCycle: new SolarCycle(
      new Date("2026-11-24T07:34:00Z"),
      new Date("2026-11-24T16:00:00Z"),
      new Date("2026-11-24T14:30:00Z")
    ),
  });

  const curitiba = new WeatherSnapshot({
    location: {
      id: "curitiba-pr-br",
      city: "Curitiba",
      region: "PR",
      country: "Brasil",
      timeZone: "America/Sao_Paulo",
      latitude: -25.4284,
      longitude: -49.2733,
    },
    observedAt: new Date("2026-11-24T10:00:00-03:00"),
    current: {
      temperature: Temperature.fromCelsius(18),
      feelsLike: Temperature.fromCelsius(18),
      humidity: 74,
      wind: new Wind(14, 160),
      uvIndex: new UvIndex(4, 6),
      condition: WeatherCondition.of("cloudy"),
    },
    hourlyForecast: [
      { time: new Date("2026-11-24T09:00:00-03:00"), temperature: Temperature.fromCelsius(17), condition: WeatherCondition.of("cloudy") },
      { time: new Date("2026-11-24T12:00:00-03:00"), temperature: Temperature.fromCelsius(19), condition: WeatherCondition.of("cloudy") },
      { time: new Date("2026-11-24T15:00:00-03:00"), temperature: Temperature.fromCelsius(20), condition: WeatherCondition.of("partly-cloudy") },
      { time: new Date("2026-11-24T18:00:00-03:00"), temperature: Temperature.fromCelsius(16), condition: WeatherCondition.of("cloudy") },
      { time: new Date("2026-11-24T21:00:00-03:00"), temperature: Temperature.fromCelsius(14), condition: WeatherCondition.of("cloudy") },
    ],
    dailyForecast: [
      { date: new Date("2026-11-24T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(13), maxTemperature: Temperature.fromCelsius(20), condition: WeatherCondition.of("cloudy") },
      { date: new Date("2026-11-25T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(12), maxTemperature: Temperature.fromCelsius(21), condition: WeatherCondition.of("partly-cloudy") },
      { date: new Date("2026-11-26T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(14), maxTemperature: Temperature.fromCelsius(19), condition: WeatherCondition.of("rain") },
      { date: new Date("2026-11-27T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(11), maxTemperature: Temperature.fromCelsius(18), condition: WeatherCondition.of("cloudy") },
      { date: new Date("2026-11-28T12:00:00-03:00"), minTemperature: Temperature.fromCelsius(13), maxTemperature: Temperature.fromCelsius(22), condition: WeatherCondition.of("clear") },
    ],
    solarCycle: new SolarCycle(
      new Date("2026-11-24T05:24:00-03:00"),
      new Date("2026-11-24T18:48:00-03:00"),
      new Date("2026-11-24T10:00:00-03:00")
    ),
  });

  return [vitoria, londres, curitiba];
}

export class InMemoryWeatherRepository {
  /** @type {WeatherSnapshot[]} */
  #snapshots;

  /** @type {number} */
  #simulatedDelayMs;

  /**
   * @param {{ simulatedDelayMs?: number }} [options]
   */
  constructor({ simulatedDelayMs = 0 } = {}) {
    this.#snapshots = createSeedSnapshots();
    this.#simulatedDelayMs = simulatedDelayMs;
  }

  async #waitIfConfigured() {
    if (this.#simulatedDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.#simulatedDelayMs));
    }
  }

  /**
   * @returns {Promise<WeatherSnapshot>}
   */
  async getDefault() {
    await this.#waitIfConfigured();
    return this.#snapshots[0];
  }

  /**
   * @param {string} query
   * @returns {Promise<WeatherSnapshot | null>}
   */
  async findByQuery(query) {
    await this.#waitIfConfigured();
    const needle = normalizeText(query);
    return (
      this.#snapshots.find((snapshot) => {
        const haystack = normalizeText(
          `${snapshot.location.city} ${snapshot.location.region} ${snapshot.location.country}`
        );
        return haystack.includes(needle);
      }) ?? null
    );
  }

  /**
   * Retorna a cidade mais próxima no conjunto in-memory.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<WeatherSnapshot>}
   */
  async findByCoordinates(latitude, longitude) {
    await this.#waitIfConfigured();
    let closest = this.#snapshots[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (const snapshot of this.#snapshots) {
      const dLat = snapshot.location.latitude - latitude;
      const dLon = snapshot.location.longitude - longitude;
      const distance = Math.hypot(dLat, dLon);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closest = snapshot;
      }
    }

    return closest;
  }
}
