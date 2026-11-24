import { Temperature } from "../value-objects/Temperature.js";
import { WeatherCondition } from "../value-objects/WeatherCondition.js";
import { Wind } from "../value-objects/Wind.js";
import { UvIndex } from "../value-objects/UvIndex.js";
import { SolarCycle } from "../value-objects/SolarCycle.js";

/**
 * @typedef {"warmer" | "similar" | "cooler"} ThermalSensation
 *
 * @typedef {Object} LocationInfo
 * @property {string} id
 * @property {string} city
 * @property {string} region
 * @property {string} country
 * @property {string} timeZone
 * @property {number} latitude
 * @property {number} longitude
 *
 * @typedef {Object} CurrentWeather
 * @property {Temperature} temperature
 * @property {Temperature} feelsLike
 * @property {number} humidity
 * @property {Wind} wind
 * @property {UvIndex} uvIndex
 * @property {WeatherCondition} condition
 *
 * @typedef {Object} HourlyReading
 * @property {Date} time
 * @property {Temperature} temperature
 * @property {WeatherCondition} condition
 *
 * @typedef {Object} DailyForecast
 * @property {Date} date
 * @property {Temperature} minTemperature
 * @property {Temperature} maxTemperature
 * @property {WeatherCondition} condition
 */

export class WeatherSnapshot {
  /**
   * @param {{
   *   location: LocationInfo,
   *   observedAt: Date,
   *   current: CurrentWeather,
   *   hourlyForecast: HourlyReading[],
   *   dailyForecast: DailyForecast[],
   *   solarCycle: SolarCycle
   * }} params
   */
  constructor({ location, observedAt, current, hourlyForecast, dailyForecast, solarCycle }) {
    if (!location?.city) {
      throw new TypeError("WeatherSnapshot requires a valid location.");
    }
    if (!(observedAt instanceof Date)) {
      throw new TypeError("WeatherSnapshot requires an observedAt Date.");
    }
    if (!(current?.temperature instanceof Temperature) || !(current?.feelsLike instanceof Temperature)) {
      throw new TypeError("Current weather requires Temperature value objects.");
    }
    if (typeof current.humidity !== "number" || current.humidity < 0 || current.humidity > 100) {
      throw new RangeError(`Invalid humidity percentage: ${current.humidity}`);
    }
    if (!(current.wind instanceof Wind) || !(current.uvIndex instanceof UvIndex)) {
      throw new TypeError("Current weather requires Wind and UvIndex value objects.");
    }
    if (!(current.condition instanceof WeatherCondition)) {
      throw new TypeError("Current weather requires a WeatherCondition value object.");
    }
    if (!(solarCycle instanceof SolarCycle)) {
      throw new TypeError("WeatherSnapshot requires a SolarCycle value object.");
    }

    /** @readonly */
    this.location = Object.freeze({ ...location });

    /** @readonly */
    this.observedAt = new Date(observedAt.getTime());

    /** @readonly */
    this.current = Object.freeze({ ...current });

    /** @readonly */
    this.hourlyForecast = Object.freeze(hourlyForecast.map((item) => Object.freeze({ ...item })));

    /** @readonly */
    this.dailyForecast = Object.freeze(dailyForecast.map((item) => Object.freeze({ ...item })));

    /** @readonly */
    this.solarCycle = solarCycle;

    Object.freeze(this);
  }

  /**
   * @returns {import("../value-objects/WeatherCondition.js").AtmosphericTheme}
   */
  get atmosphericTheme() {
    return this.current.condition.theme;
  }

  /**
   * Limiar de ±2 °C evita oscilações de rótulo por diferenças imperceptíveis de arredondamento.
   * @returns {ThermalSensation}
   */
  get thermalSensation() {
    const delta = this.current.feelsLike.deltaCelsiusFrom(this.current.temperature);
    if (delta >= 2) return "warmer";
    if (delta <= -2) return "cooler";
    return "similar";
  }

  /**
   * Amplitude térmica global da previsão de 5 dias (para normalizar as barras).
   * @returns {{ minCelsius: number, maxCelsius: number }}
   */
  get dailyTemperatureBounds() {
    const mins = this.dailyForecast.map((day) => day.minTemperature.celsius);
    const maxs = this.dailyForecast.map((day) => day.maxTemperature.celsius);
    return {
      minCelsius: Math.min(...mins),
      maxCelsius: Math.max(...maxs),
    };
  }

  /**
   * Normaliza o intervalo diário em relação aos extremos dos 5 dias para que
   * todas as barras compartilhem a mesma escala térmica.
   * @param {DailyForecast} day
   * @returns {{ startRatio: number, spanRatio: number }}
   */
  getDailyRangeRatio(day) {
    const { minCelsius, maxCelsius } = this.dailyTemperatureBounds;
    const totalSpan = maxCelsius - minCelsius;

    // Evita divisão por zero caso todos os dias tenham a mesma temperatura.
    if (totalSpan <= 0) {
      return { startRatio: 0, spanRatio: 1 };
    }

    const startRatio = (day.minTemperature.celsius - minCelsius) / totalSpan;
    const rawSpan = (day.maxTemperature.celsius - day.minTemperature.celsius) / totalSpan;
    const spanRatio = Math.max(rawSpan, 0.08);

    return {
      startRatio: Math.min(startRatio, 1 - spanRatio),
      spanRatio,
    };
  }

  /**
   * Posição normalizada (0..1) da temperatura atual dentro da escala dos 5 dias
   * para posicionar o marcador "agora" na barra de hoje.
   * @returns {number}
   */
  getCurrentTemperatureRatio() {
    const { minCelsius, maxCelsius } = this.dailyTemperatureBounds;
    const totalSpan = maxCelsius - minCelsius;
    if (totalSpan <= 0) return 0.5;

    const raw = (this.current.temperature.celsius - minCelsius) / totalSpan;
    return Math.min(Math.max(raw, 0), 1);
  }
}
