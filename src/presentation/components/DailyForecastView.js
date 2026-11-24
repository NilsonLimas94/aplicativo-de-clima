import {
  formatConditionLabel,
  formatShortWeekday,
  formatTemperature,
} from "../formatters/weatherFormatter.js";
import { createWeatherIconMarkup } from "../icons/weatherIcons.js";

export class DailyForecastView {
  /** @type {HTMLOListElement} */
  #listElement;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    const listElement = root.querySelector("[data-daily-list]");
    if (!(listElement instanceof HTMLOListElement)) {
      throw new Error("DailyForecastView could not find [data-daily-list].");
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
    const currentRatio = snapshot.getCurrentTemperatureRatio();

    snapshot.dailyForecast.forEach((day, index) => {
      const isToday = index === 0;
      const row = document.createElement("li");
      row.className = "daily-row";

      const weekday = document.createElement("time");
      weekday.className = "daily-row__day";
      weekday.dateTime = day.date.toISOString().slice(0, 10);
      weekday.textContent = isToday ? "Hoje" : formatShortWeekday(day.date, timeZone);

      const iconWrapper = document.createElement("span");
      iconWrapper.className = "daily-row__icon";
      iconWrapper.innerHTML = createWeatherIconMarkup(day.condition.code, "sm");

      const conditionSr = document.createElement("span");
      conditionSr.className = "sr-only";
      conditionSr.textContent = formatConditionLabel(day.condition.code);

      const minTemp = document.createElement("span");
      minTemp.className = "daily-row__min tabular";
      minTemp.textContent = formatTemperature(day.minTemperature, unit);

      const { startRatio, spanRatio } = snapshot.getDailyRangeRatio(day);
      const endInsetRatio = Math.max(0, 1 - (startRatio + spanRatio));

      const track = document.createElement("span");
      track.className = "daily-row__range";
      track.setAttribute("aria-hidden", "true");

      const bar = document.createElement("span");
      bar.className = "daily-row__range-fill";
      bar.style.setProperty("--range-start", `${(startRatio * 100).toFixed(1)}%`);
      bar.style.setProperty("--range-end-inset", `${(endInsetRatio * 100).toFixed(1)}%`);
      track.append(bar);

      if (isToday) {
        const currentDot = document.createElement("span");
        currentDot.className = "daily-row__current-dot";
        currentDot.style.setProperty("--current-pos", `${(currentRatio * 100).toFixed(1)}%`);
        track.append(currentDot);
      }

      const maxTemp = document.createElement("span");
      maxTemp.className = "daily-row__max tabular";
      maxTemp.textContent = formatTemperature(day.maxTemperature, unit);

      row.append(weekday, iconWrapper, conditionSr, minTemp, track, maxTemp);
      fragment.append(row);
    });

    this.#listElement.replaceChildren(fragment);
  }
}
