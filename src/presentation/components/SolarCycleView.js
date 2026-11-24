import { formatClockTime, formatSolarPhaseLabel } from "../formatters/weatherFormatter.js";

export class SolarCycleView {
  /** @type {SVGPathElement} */
  #arcPath;

  /** @type {SVGRectElement} */
  #elapsedClipRect;

  /** @type {SVGGElement} */
  #sunMarker;

  /** @type {HTMLTimeElement} */
  #sunriseElement;

  /** @type {HTMLTimeElement} */
  #sunsetElement;

  /** @type {HTMLElement} */
  #phaseElement;

  /** @type {HTMLElement} */
  #summarySrElement;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    const arcPath = root.querySelector("[data-solar-arc]");
    const elapsedClipRect = root.querySelector("[data-solar-clip-rect]");
    const sunMarker = root.querySelector("[data-solar-marker]");
    const sunriseElement = root.querySelector("[data-solar-sunrise]");
    const sunsetElement = root.querySelector("[data-solar-sunset]");
    const phaseElement = root.querySelector("[data-solar-phase]");
    const summarySrElement = root.querySelector("[data-solar-summary]");

    if (
      !(arcPath instanceof SVGPathElement) ||
      !(elapsedClipRect instanceof SVGRectElement) ||
      !(sunMarker instanceof SVGGElement) ||
      !(sunriseElement instanceof HTMLTimeElement) ||
      !(sunsetElement instanceof HTMLTimeElement) ||
      !(phaseElement instanceof HTMLElement) ||
      !(summarySrElement instanceof HTMLElement)
    ) {
      throw new Error("SolarCycleView could not find required SVG or time elements.");
    }

    this.#arcPath = arcPath;
    this.#elapsedClipRect = elapsedClipRect;
    this.#sunMarker = sunMarker;
    this.#sunriseElement = sunriseElement;
    this.#sunsetElement = sunsetElement;
    this.#phaseElement = phaseElement;
    this.#summarySrElement = summarySrElement;
  }

  /**
   * @param {Readonly<import("../../application/WeatherStore.js").WeatherAppState>} state
   */
  render(state) {
    const { snapshot } = state;
    if (!snapshot) return;

    const { solarCycle, location } = snapshot;
    const sunriseText = formatClockTime(solarCycle.sunrise, location.timeZone);
    const sunsetText = formatClockTime(solarCycle.sunset, location.timeZone);

    this.#sunriseElement.dateTime = solarCycle.sunrise.toISOString();
    this.#sunriseElement.textContent = sunriseText;

    this.#sunsetElement.dateTime = solarCycle.sunset.toISOString();
    this.#sunsetElement.textContent = sunsetText;

    this.#phaseElement.textContent = formatSolarPhaseLabel(solarCycle.phase);

    // Usa geometria nativa do SVG para posicionar o sol exatamente sobre a curva sem matemática manual de Bézier.
    const totalLength = this.#arcPath.getTotalLength();
    const point = this.#arcPath.getPointAtLength(solarCycle.progress * totalLength);

    this.#sunMarker.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    this.#sunMarker.dataset.daytime = String(solarCycle.isDaytime);

    // Recorta a cópia iluminada do arco na posição X do sol mantendo o tracejado perfeitamente alinhado.
    this.#elapsedClipRect.setAttribute("width", point.x.toFixed(1));

    const percent = Math.round(solarCycle.progress * 100);
    this.#summarySrElement.textContent = solarCycle.isDaytime
      ? `Sol a ${percent}% do percurso entre ${sunriseText} e ${sunsetText}.`
      : `Período noturno. Nascer do sol às ${sunriseText} e pôr do sol às ${sunsetText}.`;
  }
}
