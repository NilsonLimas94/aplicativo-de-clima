export class AppStateView {
  /** @type {HTMLElement} */
  #gridElement;

  /** @type {HTMLElement} */
  #errorSection;

  /** @type {HTMLElement} */
  #errorMessage;

  /**
   * @param {{
   *   gridElement: HTMLElement,
   *   errorSection: HTMLElement,
   *   onRetry: () => void
   * }} params
   */
  constructor({ gridElement, errorSection, onRetry }) {
    const errorMessage = errorSection.querySelector("[data-error-message]");
    const retryButton = errorSection.querySelector("[data-retry-button]");

    if (
      !(errorMessage instanceof HTMLElement) ||
      !(retryButton instanceof HTMLButtonElement)
    ) {
      throw new Error("AppStateView could not find required error state elements.");
    }

    this.#gridElement = gridElement;
    this.#errorSection = errorSection;
    this.#errorMessage = errorMessage;

    retryButton.addEventListener("click", () => {
      onRetry();
    });
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const hasFatalError = state.status === "error" && state.snapshot === null;
    const isLoading = state.status === "loading";

    this.#gridElement.hidden = hasFatalError;
    this.#errorSection.hidden = !hasFatalError;

    this.#gridElement.dataset.state = isLoading ? "loading" : state.status;
    this.#gridElement.setAttribute("aria-busy", String(isLoading));

    if (hasFatalError) {
      this.#errorMessage.textContent =
        state.feedback?.message ?? "Não foi possível obter a previsão do tempo.";
    }
  }
}
