/**
 * Retorna um SVG minimalista para o código climático do domínio.
 * Mantido como markup estático com `aria-hidden="true"` porque a descrição
 * textual da condição já fornece o significado semântico para leitores de tela.
 *
 * @param {import("../../domain/value-objects/WeatherCondition.js").WeatherConditionCode} code
 * @param {"hero" | "sm"} [size="sm"]
 * @returns {string}
 */
export function createWeatherIconMarkup(code, size = "sm") {
  const sizeClass = `weather-icon weather-icon--${size} weather-icon--${code}`;

  switch (code) {
    case "clear":
      return `
        <svg class="${sizeClass}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g class="weather-icon__sun-rays" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="12" />
            <line x1="32" y1="52" x2="32" y2="58" />
            <line x1="6" y1="32" x2="12" y2="32" />
            <line x1="52" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="17.9" y2="17.9" />
            <line x1="46.1" y1="46.1" x2="50.4" y2="50.4" />
            <line x1="50.4" y1="13.6" x2="46.1" y2="17.9" />
            <line x1="17.9" y1="46.1" x2="13.6" y2="50.4" />
          </g>
          <circle class="weather-icon__sun-core" cx="32" cy="32" r="12" stroke="currentColor" stroke-width="3.2" />
        </svg>
      `;

    case "partly-cloudy":
      // Inclui os 8 raios completos ao redor de (42, 21) para que o centro de rotação
      // (transform-box: fill-box) coincida exatamente com o disco solar; a nuvem encobre os inferiores.
      return `
        <svg class="${sizeClass}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g class="weather-icon__sun-rays" stroke="var(--icon-sun)" stroke-width="2.6" stroke-linecap="round">
            <line x1="42" y1="6" x2="42" y2="9.5" />
            <line x1="42" y1="32.5" x2="42" y2="36" />
            <line x1="27" y1="21" x2="30.5" y2="21" />
            <line x1="53.5" y1="21" x2="57" y2="21" />
            <line x1="50.1" y1="12.9" x2="52.6" y2="10.4" />
            <line x1="33.9" y1="29.1" x2="31.4" y2="31.6" />
            <line x1="33.9" y1="12.9" x2="31.4" y2="10.4" />
            <line x1="50.1" y1="29.1" x2="52.6" y2="31.6" />
          </g>
          <circle cx="42" cy="21" r="8" fill="var(--icon-sun)" opacity="0.95" />
          <path
            class="weather-icon__cloud"
            d="M19 47h24a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 20.3 25a10 10 0 0 0-1.3 22Z"
            fill="var(--icon-cloud)"
          />
        </svg>
      `;

    case "cloudy":
      return `
        <svg class="${sizeClass}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path
            d="M27 37h21a7.5 7.5 0 0 0 1.2-14.9A10.5 10.5 0 0 0 28.8 19a8.5 8.5 0 0 0-1.8 18Z"
            fill="var(--icon-cloud-muted)"
          />
          <path
            class="weather-icon__cloud"
            d="M17 48h26a9.5 9.5 0 0 0 1.5-18.9A13 13 0 0 0 19.4 25a10.5 10.5 0 0 0-2.4 23Z"
            fill="var(--icon-cloud)"
          />
        </svg>
      `;

    case "rain":
      return `
        <svg class="${sizeClass}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path
            class="weather-icon__cloud"
            d="M18 40h26a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 20.3 18a10 10 0 0 0-2.3 22Z"
            fill="var(--icon-cloud)"
          />
          <g class="weather-icon__rain" stroke="var(--icon-rain)" stroke-width="3" stroke-linecap="round">
            <line class="weather-icon__drop" x1="23" y1="45" x2="20" y2="54" />
            <line class="weather-icon__drop" x1="33" y1="45" x2="30" y2="54" />
            <line class="weather-icon__drop" x1="43" y1="45" x2="40" y2="54" />
          </g>
        </svg>
      `;

    case "storm":
      return `
        <svg class="${sizeClass}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path
            class="weather-icon__cloud"
            d="M18 39h26a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 20.3 17a10 10 0 0 0-2.3 22Z"
            fill="var(--icon-cloud)"
          />
          <path
            class="weather-icon__bolt"
            d="M34 39 26 50h6l-2 9 10-12h-6l2-8Z"
            fill="var(--icon-sun)"
          />
        </svg>
      `;
  }
}
