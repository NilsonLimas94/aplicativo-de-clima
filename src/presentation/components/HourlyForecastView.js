import {
  formatConditionLabel,
  formatHourLabel,
  formatTemperature,
} from "../formatters/weatherFormatter.js";
import { createWeatherIconMarkup } from "../icons/weatherIcons.js";

export class HourlyForecastView {
  /** @type {HTMLOListElement} */
  #listElement;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    const listElement = root.querySelector("[data-hourly-list]");
    if (!(listElement instanceof HTMLOListElement)) {
      throw new Error("HourlyForecastView could not find [data-hourly-list].");
    }

    this.#listElement = listElement;
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const { snapshot, unit } = state;
    if (!snapshot) return;

    const fragment = document.createDocumentFragment();
    const { timeZone } = snapshot.location;

    for (const reading of snapshot.hourlyForecast) {
      const item = document.createElement("li");
      item.className = "hourly-item";

      const time = document.createElement("time");
      time.className = "hourly-item__time tabular";
      time.dateTime = reading.time.toISOString();
      time.textContent = formatHourLabel(reading.time, timeZone);

      const iconWrapper = document.createElement("span");
      iconWrapper.className = "hourly-item__icon";
      iconWrapper.innerHTML = createWeatherIconMarkup(reading.condition.code, "sm");

      const conditionSr = document.createElement("span");
      conditionSr.className = "sr-only";
      conditionSr.textContent = formatConditionLabel(reading.condition.code);

      const temp = document.createElement("span");
      temp.className = "hourly-item__temp tabular";
      temp.textContent = formatTemperature(reading.temperature, unit);

      item.append(time, iconWrapper, conditionSr, temp);
      fragment.append(item);
    }

    this.#listElement.replaceChildren(fragment);
  }
}
