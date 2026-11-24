/** @type {Record<import("../../domain/value-objects/WeatherCondition.js").WeatherConditionCode, string>} */
const CONDITION_LABELS_PT_BR = Object.freeze({
  clear: "Céu Limpo",
  "partly-cloudy": "Parcialmente Nublado",
  cloudy: "Nublado",
  rain: "Chuva",
  storm: "Tempestade",
});

/** @type {Record<import("../../domain/entities/WeatherSnapshot.js").ThermalSensation, string>} */
const THERMAL_SENSATION_LABELS_PT_BR = Object.freeze({
  warmer: "Mais quente que a temperatura real",
  similar: "Similar à temperatura real",
  cooler: "Mais fria que a temperatura real",
});

/** @type {Record<import("../../domain/value-objects/UvIndex.js").UvRiskLevel, string>} */
const UV_RISK_LABELS_PT_BR = Object.freeze({
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  "very-high": "Muito Alto",
  extreme: "Extremo",
});

/**
 * @param {import("../../domain/value-objects/WeatherCondition.js").WeatherConditionCode} code
 * @returns {string}
 */
export function formatConditionLabel(code) {
  return CONDITION_LABELS_PT_BR[code];
}

/**
 * @param {import("../../domain/entities/WeatherSnapshot.js").ThermalSensation} sensation
 * @returns {string}
 */
export function formatThermalSensationLabel(sensation) {
  return THERMAL_SENSATION_LABELS_PT_BR[sensation];
}

/** @type {Record<import("../../domain/value-objects/SolarCycle.js").SolarPhase, string>} */
const SOLAR_PHASE_LABELS_PT_BR = Object.freeze({
  "before-sunrise": "Antes do amanhecer",
  daytime: "",
  "after-sunset": "Após o pôr do sol",
});

/**
 * @param {import("../../domain/value-objects/SolarCycle.js").SolarPhase} phase
 * @returns {string}
 */
export function formatSolarPhaseLabel(phase) {
  return SOLAR_PHASE_LABELS_PT_BR[phase];
}

/**
 * @param {import("../../domain/value-objects/UvIndex.js").UvRiskLevel} riskLevel
 * @returns {string}
 */
export function formatUvRiskLabel(riskLevel) {
  return UV_RISK_LABELS_PT_BR[riskLevel];
}

/**
 * @param {import("../../domain/value-objects/Temperature.js").Temperature} temperature
 * @param {import("../../domain/value-objects/Temperature.js").TemperatureUnit} unit
 * @returns {string}
 */
export function formatTemperature(temperature, unit) {
  return `${temperature.roundedIn(unit)}°`;
}

/**
 * @param {import("../../domain/entities/WeatherSnapshot.js").LocationInfo} location
 * @returns {string}
 */
export function formatLocationTitle(location) {
  return location.region ? `${location.city}, ${location.region}` : location.city;
}

/**
 * Formata a data no fuso da cidade consultada (e não no fuso do navegador)
 * para evitar divergência de dia ao consultar localidades em outros continentes.
 * @param {Date} date
 * @param {string} timeZone
 * @returns {string}
 */
export function formatFullDate(date, timeZone) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Usa formatToParts em vez de format() direto porque o sufixo "h" varia entre
 * motores JS no locale pt-BR; assim garantimos sempre o padrão "09h", "15h".
 * @param {Date} date
 * @param {string} timeZone
 * @returns {string}
 */
export function formatHourLabel(date, timeZone) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  const hourPart = parts.find((part) => part.type === "hour")?.value ?? "00";
  // Alguns engines retornam "24" para meia-noite quando hour12 é false.
  const normalizedHour = hourPart === "24" ? "00" : hourPart;
  return `${normalizedHour}h`;
}

/**
 * Remove o ponto abreviativo padrão do locale pt-BR ("ter." -> "Ter") para
 * manter alinhamento limpo na coluna de dias da semana.
 * @param {Date} date
 * @param {string} timeZone
 * @returns {string}
 */
export function formatShortWeekday(date, timeZone) {
  const raw = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone,
  })
    .format(date)
    .replace(/\.$/, "");

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Formata horário exato (HH:MM) no fuso da cidade consultada.
 * @param {Date} date
 * @param {string} timeZone
 * @returns {string}
 */
export function formatClockTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const normalizedHour = hour === "24" ? "00" : hour;
  return `${normalizedHour}:${minute}`;
}
