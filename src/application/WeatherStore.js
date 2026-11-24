/**
 * @typedef {"idle" | "loading" | "ready" | "error"} WeatherLoadStatus
 * @typedef {"info" | "error"} FeedbackTone
 *
 * @typedef {Object} WeatherAppState
 * @property {import("../domain/entities/WeatherSnapshot.js").WeatherSnapshot | null} snapshot
 * @property {import("../domain/value-objects/Temperature.js").TemperatureUnit} unit
 * @property {WeatherLoadStatus} status
 * @property {boolean} isLocating
 * @property {{ message: string, tone: FeedbackTone } | null} feedback
 *
 * @typedef {Object} GeolocationProviderPort
 * @property {() => Promise<{ latitude: number, longitude: number }>} getCurrentCoordinates
 */

const UNIT_STORAGE_KEY = "weather-bento:temperature-unit";

/**
 * Lê a unidade salva de forma resiliente.
 * @returns {import("../domain/value-objects/Temperature.js").TemperatureUnit}
 */
function readPersistedUnit() {
  try {
    const saved = window.localStorage.getItem(UNIT_STORAGE_KEY);
    return saved === "F" ? "F" : "C";
  } catch {
    return "C";
  }
}

export class WeatherStore extends EventTarget {
  /** @type {import("./GetWeatherUseCase.js").GetWeatherUseCase} */
  #getWeather;

  /** @type {GeolocationProviderPort} */
  #geolocationProvider;

  /** @type {WeatherAppState} */
  #state;

  /** @type {(() => Promise<void>) | null} */
  #lastAction = null;

  /**
   * @param {{
   *   getWeather: import("./GetWeatherUseCase.js").GetWeatherUseCase,
   *   geolocationProvider: GeolocationProviderPort
   * }} deps
   */
  constructor({ getWeather, geolocationProvider }) {
    super();
    this.#getWeather = getWeather;
    this.#geolocationProvider = geolocationProvider;
    this.#state = {
      snapshot: null,
      unit: readPersistedUnit(),
      status: "idle",
      isLocating: false,
      feedback: null,
    };
  }

  /**
   * @returns {Readonly<WeatherAppState>}
   */
  get state() {
    return Object.freeze({ ...this.#state });
  }

  /**
   * @param {(state: Readonly<WeatherAppState>) => void} listener
   * @returns {() => void}
   */
  subscribe(listener) {
    const handler = () => listener(this.state);
    this.addEventListener("change", handler);
    return () => this.removeEventListener("change", handler);
  }

  /**
   * @param {Partial<WeatherAppState>} patch
   */
  #update(patch) {
    this.#state = { ...this.#state, ...patch };
    this.dispatchEvent(new Event("change"));
  }

  async loadDefault() {
    this.#lastAction = () => this.loadDefault();
    this.#update({ status: "loading", feedback: null });
    try {
      const snapshot = await this.#getWeather.executeDefault();
      this.#update({ snapshot, status: "ready", feedback: null });
    } catch {
      this.#update({
        status: "error",
        feedback: { message: "Não foi possível carregar os dados climáticos.", tone: "error" },
      });
    }
  }

  /**
   * @param {string} query
   */
  async searchLocation(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      await this.loadDefault();
      return;
    }

    this.#lastAction = () => this.searchLocation(trimmed);
    this.#update({ status: "loading", feedback: null });
    try {
      const snapshot = await this.#getWeather.executeByQuery(trimmed);
      if (!snapshot) {
        this.#update({
          status: this.#state.snapshot ? "ready" : "error",
          feedback: {
            message: `Nenhuma cidade encontrada para "${trimmed}". Verifique o nome e tente novamente.`,
            tone: "error",
          },
        });
        return;
      }

      this.#update({
        snapshot,
        status: "ready",
        feedback: null,
      });
    } catch {
      this.#update({
        status: this.#state.snapshot ? "ready" : "error",
        feedback: {
          message: "Erro ao consultar a previsão para essa localidade.",
          tone: "error",
        },
      });
    }
  }

  async loadCurrentPosition() {
    if (this.#state.isLocating) return;

    this.#lastAction = () => this.loadCurrentPosition();
    this.#update({ isLocating: true, status: "loading", feedback: null });
    try {
      const { latitude, longitude } = await this.#geolocationProvider.getCurrentCoordinates();
      const snapshot = await this.#getWeather.executeByCoordinates(latitude, longitude);
      this.#update({
        snapshot,
        status: "ready",
        isLocating: false,
        feedback: null,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível acessar sua localização atual.";
      this.#update({
        status: this.#state.snapshot ? "ready" : "error",
        isLocating: false,
        feedback: { message, tone: "error" },
      });
    }
  }

  async retry() {
    if (this.#lastAction) {
      await this.#lastAction();
      return;
    }
    await this.loadDefault();
  }

  /**
   * @param {import("../domain/value-objects/Temperature.js").TemperatureUnit} unit
   */
  setUnit(unit) {
    if (unit !== "C" && unit !== "F") return;
    if (this.#state.unit === unit) return;

    try {
      window.localStorage.setItem(UNIT_STORAGE_KEY, unit);
    } catch {
      // Ignora ambientes sem permissão de armazenamento
    }

    this.#update({ unit });
  }
}
