import {
  formatTemperature,
  formatThermalSensationLabel,
  formatUvRiskLabel,
} from "../formatters/weatherFormatter.js";

export class MetricsGridView {
  /** @type {HTMLElement} */
  #feelsValue;

  /** @type {HTMLElement} */
  #feelsContext;

  /** @type {HTMLElement} */
  #humidityValue;

  /** @type {HTMLElement} */
  #humidityMeter;

  /** @type {HTMLElement} */
  #windSpeed;

  /** @type {HTMLElement} */
  #windDirectionText;

  /** @type {SVGElement} */
  #windNeedle;

  /** @type {HTMLElement} */
  #uvValue;

  /** @type {HTMLElement} */
  #uvClassification;

  /** @type {HTMLElement} */
  #uvPeak;

  /** @type {HTMLElement} */
  #uvMeter;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    const feelsValue = root.querySelector("[data-feels-value]");
    const feelsContext = root.querySelector("[data-feels-context]");
    const humidityValue = root.querySelector("[data-humidity-value]");
    const humidityMeter = root.querySelector("[data-humidity-meter]");
    const windSpeed = root.querySelector("[data-wind-speed]");
    const windDirectionText = root.querySelector("[data-wind-direction]");
    const windNeedle = root.querySelector("[data-wind-needle]");
    const uvValue = root.querySelector("[data-uv-value]");
    const uvClassification = root.querySelector("[data-uv-classification]");
    const uvPeak = root.querySelector("[data-uv-peak]");
    const uvMeter = root.querySelector("[data-uv-meter]");

    if (
      !(feelsValue instanceof HTMLElement) ||
      !(feelsContext instanceof HTMLElement) ||
      !(humidityValue instanceof HTMLElement) ||
      !(humidityMeter instanceof HTMLElement) ||
      !(windSpeed instanceof HTMLElement) ||
      !(windDirectionText instanceof HTMLElement) ||
      !(windNeedle instanceof SVGElement) ||
      !(uvValue instanceof HTMLElement) ||
      !(uvClassification instanceof HTMLElement) ||
      !(uvPeak instanceof HTMLElement) ||
      !(uvMeter instanceof HTMLElement)
    ) {
      throw new Error("MetricsGridView could not find required metric elements.");
    }

    this.#feelsValue = feelsValue;
    this.#feelsContext = feelsContext;
    this.#humidityValue = humidityValue;
    this.#humidityMeter = humidityMeter;
    this.#windSpeed = windSpeed;
    this.#windDirectionText = windDirectionText;
    this.#windNeedle = windNeedle;
    this.#uvValue = uvValue;
    this.#uvClassification = uvClassification;
    this.#uvPeak = uvPeak;
    this.#uvMeter = uvMeter;
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const { snapshot, unit } = state;
    if (!snapshot) return;

    const { current } = snapshot;

    this.#feelsValue.textContent = formatTemperature(current.feelsLike, unit);
    this.#feelsContext.textContent = formatThermalSensationLabel(snapshot.thermalSensation);

    this.#humidityValue.textContent = `${current.humidity}%`;
    this.#humidityMeter.setAttribute("aria-valuenow", String(current.humidity));
    this.#humidityMeter.style.setProperty("--meter-ratio", `${current.humidity}%`);

    this.#windSpeed.textContent = `${current.wind.speedKmh}`;
    this.#windDirectionText.textContent = `Direção ${current.wind.cardinalDirection} (${current.wind.directionDegrees}°)`;
    this.#windNeedle.style.setProperty("--wind-angle", `${current.wind.directionDegrees}deg`);

    const uvLabel = formatUvRiskLabel(current.uvIndex.riskLevel);
    this.#uvValue.textContent = String(current.uvIndex.value);
    this.#uvClassification.textContent = uvLabel;
    this.#uvPeak.textContent = `Máx. hoje: ${current.uvIndex.dailyMax}`;
    this.#uvMeter.setAttribute("aria-valuenow", String(current.uvIndex.value));
    this.#uvMeter.setAttribute("aria-valuetext", `${current.uvIndex.value} — ${uvLabel}`);
    this.#uvMeter.style.setProperty("--meter-ratio", `${Math.round(current.uvIndex.ratio * 100)}%`);
  }
}
