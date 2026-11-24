import { WeatherSnapshot } from "../../domain/entities/WeatherSnapshot.js";
import { Temperature } from "../../domain/value-objects/Temperature.js";
import { WeatherCondition } from "../../domain/value-objects/WeatherCondition.js";
import { Wind } from "../../domain/value-objects/Wind.js";
import { UvIndex } from "../../domain/value-objects/UvIndex.js";
import { SolarCycle } from "../../domain/value-objects/SolarCycle.js";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEOCODE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const REQUEST_TIMEOUT_MS = 10_000;
const HOURLY_SLOTS_COUNT = 8;

const DEFAULT_LOCATION = Object.freeze({
  id: "vitoria-es-br",
  city: "Vitória",
  region: "ES",
  country: "Brasil",
  latitude: -20.3155,
  longitude: -40.3128,
});

/**
 * Converte códigos meteorológicos WMO da Open-Meteo para a Linguagem Ubíqua do domínio
 * (Anti-Corruption Layer), isolando o domínio dos detalhes do provedor externo.
 * @param {number} wmoCode
 * @returns {WeatherCondition}
 */
function mapWmoCodeToCondition(wmoCode) {
  if (wmoCode === 0 || wmoCode === 1) return WeatherCondition.of("clear");
  if (wmoCode === 2) return WeatherCondition.of("partly-cloudy");
  if (wmoCode === 3 || wmoCode === 45 || wmoCode === 48) return WeatherCondition.of("cloudy");
  if (wmoCode >= 95 && wmoCode <= 99) return WeatherCondition.of("storm");
  if ((wmoCode >= 51 && wmoCode <= 67) || (wmoCode >= 71 && wmoCode <= 86)) {
    return WeatherCondition.of("rain");
  }
  return WeatherCondition.of("cloudy");
}

/**
 * Converte utc_offset_seconds (ex.: -10800) para sufixo ISO ("-03:00").
 * @param {number} offsetSeconds
 * @returns {string}
 */
function formatIsoOffset(offsetSeconds) {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absoluteMinutes = Math.round(Math.abs(offsetSeconds) / 60);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

/**
 * A Open-Meteo envia timestamps locais da cidade sem offset ("2026-11-24T12:15").
 * Anexamos o offset explícito para que o Date represente o instante real da cidade,
 * evitando interpretações incorretas no fuso do dispositivo do usuário.
 * @param {string} localIsoString
 * @param {string} isoOffset
 * @returns {Date}
 */
function parseCityLocalDateTime(localIsoString, isoOffset) {
  return new Date(`${localIsoString}${isoOffset}`);
}

/**
 * Usa meio-dia local para datas sem hora ("2026-11-24") para evitar troca de dia
 * em fronteiras de horário de verão ao formatar o dia da semana.
 * @param {string} localDateString
 * @param {string} isoOffset
 * @returns {Date}
 */
function parseCityLocalDate(localDateString, isoOffset) {
  return new Date(`${localDateString}T12:00${isoOffset}`);
}

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJson(url) {
  const signal =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      : undefined;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`);
  }
  return response.json();
}

export class OpenMeteoWeatherRepository {
  /**
   * @returns {Promise<WeatherSnapshot>}
   */
  async getDefault() {
    return this.#fetchForecastForLocation(DEFAULT_LOCATION);
  }

  /**
   * @param {string} query
   * @returns {Promise<WeatherSnapshot | null>}
   */
  async findByQuery(query) {
    const params = new URLSearchParams({
      name: query,
      count: "1",
      language: "pt",
      format: "json",
    });

    const data = await fetchJson(`${GEOCODING_API_URL}?${params.toString()}`);
    const match = Array.isArray(data.results) ? data.results[0] : null;
    if (!match) {
      return null;
    }

    return this.#fetchForecastForLocation({
      id: String(match.id ?? `${match.latitude},${match.longitude}`),
      city: match.name,
      region: match.admin1 && match.admin1 !== match.name ? match.admin1 : "",
      country: match.country ?? "",
      latitude: match.latitude,
      longitude: match.longitude,
    });
  }

  /**
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<WeatherSnapshot>}
   */
  async findByCoordinates(latitude, longitude) {
    const resolvedLocation = await this.#reverseGeocode(latitude, longitude);
    return this.#fetchForecastForLocation(resolvedLocation);
  }

  /**
   * Resolve nome da cidade pelas coordenadas com fallback seguro para não bloquear
   * a exibição climática se o serviço de geocodificação reversa estiver indisponível.
   * @param {number} latitude
   * @param {number} longitude
   */
  async #reverseGeocode(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "pt",
      });

      const data = await fetchJson(`${REVERSE_GEOCODE_URL}?${params.toString()}`);
      const city = data.city || data.locality || data.principalSubdivision || "Sua localização";
      const region =
        data.principalSubdivision && data.principalSubdivision !== city
          ? data.principalSubdivision
          : "";

      return {
        id: `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
        city,
        region,
        country: data.countryName ?? "",
        latitude,
        longitude,
      };
    } catch {
      return {
        id: `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
        city: "Sua localização",
        region: "",
        country: "",
        latitude,
        longitude,
      };
    }
  }

  /**
   * @param {{
   *   id: string,
   *   city: string,
   *   region: string,
   *   country: string,
   *   latitude: number,
   *   longitude: number
   * }} baseLocation
   * @returns {Promise<WeatherSnapshot>}
   */
  async #fetchForecastForLocation(baseLocation) {
    const params = new URLSearchParams({
      latitude: String(baseLocation.latitude),
      longitude: String(baseLocation.longitude),
      timezone: "auto",
      forecast_days: "5",
      current: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
      ].join(","),
      hourly: ["temperature_2m", "weather_code", "uv_index"].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
      ].join(","),
    });

    const data = await fetchJson(`${FORECAST_API_URL}?${params.toString()}`);

    const timeZone = data.timezone || "UTC";
    const isoOffset = formatIsoOffset(Number(data.utc_offset_seconds ?? 0));
    const observedAt = parseCityLocalDateTime(data.current.time, isoOffset);

    const hourlyTimes = data.hourly.time;
    const currentHourPrefix = data.current.time.slice(0, 13);
    const startIndex = Math.max(
      0,
      hourlyTimes.findIndex((/** @type {string} */ t) => t.slice(0, 13) >= currentHourPrefix)
    );

    const currentUvRaw = data.hourly.uv_index?.[startIndex] ?? 0;
    const dailyUvMaxRaw = data.daily.uv_index_max?.[0] ?? currentUvRaw;

    const hourlyForecast = [];
    for (let i = startIndex; i < Math.min(startIndex + HOURLY_SLOTS_COUNT, hourlyTimes.length); i += 1) {
      hourlyForecast.push({
        time: parseCityLocalDateTime(hourlyTimes[i], isoOffset),
        temperature: Temperature.fromCelsius(Number(data.hourly.temperature_2m[i])),
        condition: mapWmoCodeToCondition(Number(data.hourly.weather_code[i])),
      });
    }

    const dailyForecast = data.daily.time.slice(0, 5).map((/** @type {string} */ dateStr, /** @type {number} */ index) => ({
      date: parseCityLocalDate(dateStr, isoOffset),
      minTemperature: Temperature.fromCelsius(Number(data.daily.temperature_2m_min[index])),
      maxTemperature: Temperature.fromCelsius(Number(data.daily.temperature_2m_max[index])),
      condition: mapWmoCodeToCondition(Number(data.daily.weather_code[index])),
    }));

    const sunrise = parseCityLocalDateTime(data.daily.sunrise[0], isoOffset);
    const sunset = parseCityLocalDateTime(data.daily.sunset[0], isoOffset);

    return new WeatherSnapshot({
      location: {
        ...baseLocation,
        timeZone,
      },
      observedAt,
      current: {
        temperature: Temperature.fromCelsius(Number(data.current.temperature_2m)),
        feelsLike: Temperature.fromCelsius(Number(data.current.apparent_temperature)),
        humidity: Math.round(Number(data.current.relative_humidity_2m)),
        wind: new Wind(
          Number(data.current.wind_speed_10m),
          Number(data.current.wind_direction_10m)
        ),
        uvIndex: new UvIndex(
          Math.max(0, Number(currentUvRaw)),
          Math.max(0, Number(dailyUvMaxRaw))
        ),
        condition: mapWmoCodeToCondition(Number(data.current.weather_code)),
      },
      hourlyForecast,
      dailyForecast,
      solarCycle: new SolarCycle(sunrise, sunset, observedAt),
    });
  }
}
