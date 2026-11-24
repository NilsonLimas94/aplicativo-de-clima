export class TopBarView {
  /** @type {HTMLFormElement} */
  #form;

  /** @type {HTMLInputElement} */
  #searchInput;

  /** @type {HTMLButtonElement} */
  #geoButton;

  /** @type {HTMLFieldSetElement} */
  #unitSwitch;

  /** @type {HTMLElement} */
  #feedbackElement;

  /**
   * @param {{
   *   root: HTMLElement,
   *   onSearch: (query: string) => void,
   *   onGeolocate: () => void,
   *   onUnitChange: (unit: import("../../domain/value-objects/Temperature.js").TemperatureUnit) => void
   * }} params
   */
  constructor({ root, onSearch, onGeolocate, onUnitChange }) {
    const form = root.querySelector("[data-search-form]");
    const searchInput = root.querySelector("[data-search-input]");
    const geoButton = root.querySelector("[data-geo-button]");
    const unitSwitch = root.querySelector("[data-unit-switch]");
    const feedbackElement = root.querySelector("[data-top-bar-feedback]");

    if (
      !(form instanceof HTMLFormElement) ||
      !(searchInput instanceof HTMLInputElement) ||
      !(geoButton instanceof HTMLButtonElement) ||
      !(unitSwitch instanceof HTMLFieldSetElement) ||
      !(feedbackElement instanceof HTMLElement)
    ) {
      throw new Error("TopBarView could not find required semantic elements.");
    }

    this.#form = form;
    this.#searchInput = searchInput;
    this.#geoButton = geoButton;
    this.#unitSwitch = unitSwitch;
    this.#feedbackElement = feedbackElement;

    this.#form.addEventListener("submit", (event) => {
      event.preventDefault();
      onSearch(this.#searchInput.value);
    });

    this.#geoButton.addEventListener("click", () => {
      onGeolocate();
    });

    this.#unitSwitch.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && (target.value === "C" || target.value === "F")) {
        onUnitChange(target.value);
      }
    });
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const activeRadio = this.#unitSwitch.querySelector(`input[value="${state.unit}"]`);
    if (activeRadio instanceof HTMLInputElement && !activeRadio.checked) {
      activeRadio.checked = true;
    }

    this.#geoButton.disabled = state.isLocating;
    this.#geoButton.dataset.locating = String(state.isLocating);
    this.#geoButton.setAttribute("aria-busy", String(state.isLocating));

    if (state.feedback) {
      this.#feedbackElement.textContent = state.feedback.message;
      this.#feedbackElement.dataset.tone = state.feedback.tone;
    } else {
      this.#feedbackElement.textContent = "";
      delete this.#feedbackElement.dataset.tone;
    }
  }
}
