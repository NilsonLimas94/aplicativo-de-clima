import {
  formatConditionLabel,
  formatFullDate,
  formatLocationTitle,
  formatTemperature,
} from "../formatters/weatherFormatter.js";
import { createWeatherIconMarkup } from "../icons/weatherIcons.js";

export class HeroCardView {
  /** @type {HTMLElement} */
  #locationElement;

  /** @type {HTMLElement} */
  #countryElement;

  /** @type {HTMLTimeElement} */
  #dateElement;

  /** @type {HTMLElement} */
  #temperatureElement;

  /** @type {HTMLElement} */
  #conditionElement;

  /** @type {HTMLElement} */
  #iconSlot;

  /** @type {import("../../domain/value-objects/WeatherCondition.js").WeatherConditionCode | null} */
  #renderedConditionCode = null;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    const locationElement = root.querySelector("[data-hero-location]");
    const countryElement = root.querySelector("[data-hero-country]");
    const dateElement = root.querySelector("[data-hero-date]");
    const temperatureElement = root.querySelector("[data-hero-temp]");
    const conditionElement = root.querySelector("[data-hero-condition]");
    const iconSlot = root.querySelector("[data-hero-icon]");

    if (
      !(locationElement instanceof HTMLElement) ||
      !(countryElement instanceof HTMLElement) ||
      !(dateElement instanceof HTMLTimeElement) ||
      !(temperatureElement instanceof HTMLElement) ||
      !(conditionElement instanceof HTMLElement) ||
      !(iconSlot instanceof HTMLElement)
    ) {
      throw new Error("HeroCardView could not find required semantic elements.");
    }

    this.#locationElement = locationElement;
    this.#countryElement = countryElement;
    this.#dateElement = dateElement;
    this.#temperatureElement = temperatureElement;
    this.#conditionElement = conditionElement;
    this.#iconSlot = iconSlot;
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const { snapshot, unit } = state;
    if (!snapshot) return;

    this.#locationElement.textContent = formatLocationTitle(snapshot.location);
    this.#countryElement.textContent = snapshot.location.country;

    this.#dateElement.dateTime = snapshot.observedAt.toISOString();
    this.#dateElement.textContent = formatFullDate(snapshot.observedAt, snapshot.location.timeZone);

    this.#temperatureElement.textContent = formatTemperature(snapshot.current.temperature, unit);
    this.#conditionElement.textContent = formatConditionLabel(snapshot.current.condition.code);

    // Só substitui o SVG quando a condição muda para não reiniciar a animação CSS ao alternar °C/°F.
    if (this.#renderedConditionCode !== snapshot.current.condition.code) {
      this.#iconSlot.innerHTML = createWeatherIconMarkup(snapshot.current.condition.code, "hero");
      this.#renderedConditionCode = snapshot.current.condition.code;
    }
  }
}
