import { GetWeatherUseCase } from "./application/GetWeatherUseCase.js";
import { WeatherStore } from "./application/WeatherStore.js";
import { OpenMeteoWeatherRepository } from "./infrastructure/repositories/OpenMeteoWeatherRepository.js";
import { BrowserGeolocationProvider } from "./infrastructure/geolocation/BrowserGeolocationProvider.js";
import { AppStateView } from "./presentation/components/AppStateView.js";
import { TopBarView } from "./presentation/components/TopBarView.js";
import { HeroCardView } from "./presentation/components/HeroCardView.js";
import { HourlyForecastView } from "./presentation/components/HourlyForecastView.js";
import { MetricsGridView } from "./presentation/components/MetricsGridView.js";
import { DailyForecastView } from "./presentation/components/DailyForecastView.js";
import { SolarCycleView } from "./presentation/components/SolarCycleView.js";

const weatherRepository = new OpenMeteoWeatherRepository();
const getWeather = new GetWeatherUseCase(weatherRepository);
const geolocationProvider = new BrowserGeolocationProvider();
const store = new WeatherStore({ getWeather, geolocationProvider });

const topBarRoot = document.querySelector("[data-top-bar]");
const errorSection = document.querySelector("[data-error-state]");
const bentoGridRoot = document.querySelector("[data-bento-grid]");
const heroCardRoot = document.querySelector("[data-hero-card]");
const hourlyCardRoot = document.querySelector("[data-hourly-card]");
const dailyCardRoot = document.querySelector("[data-daily-card]");
const solarCardRoot = document.querySelector("[data-solar-card]");

if (
  !(topBarRoot instanceof HTMLElement) ||
  !(errorSection instanceof HTMLElement) ||
  !(bentoGridRoot instanceof HTMLElement) ||
  !(heroCardRoot instanceof HTMLElement) ||
  !(hourlyCardRoot instanceof HTMLElement) ||
  !(dailyCardRoot instanceof HTMLElement) ||
  !(solarCardRoot instanceof HTMLElement)
) {
  throw new Error("Missing required view containers in DOM.");
}

const appStateView = new AppStateView({
  gridElement: bentoGridRoot,
  errorSection,
  onRetry: () => store.retry(),
});

const topBarView = new TopBarView({
  root: topBarRoot,
  onSearch: (query) => store.searchLocation(query),
  onGeolocate: () => store.loadCurrentPosition(),
  onUnitChange: (unit) => store.setUnit(unit),
});

const heroCardView = new HeroCardView(heroCardRoot);
const hourlyForecastView = new HourlyForecastView(hourlyCardRoot);
const metricsGridView = new MetricsGridView(bentoGridRoot);
const dailyForecastView = new DailyForecastView(dailyCardRoot);
const solarCycleView = new SolarCycleView(solarCardRoot);

store.subscribe((state) => {
  if (state.snapshot) {
    document.documentElement.dataset.theme = state.snapshot.atmosphericTheme;
  }
  appStateView.render(state);
  topBarView.render(state);
  heroCardView.render(state);
  hourlyForecastView.render(state);
  metricsGridView.render(state);
  dailyForecastView.render(state);
  solarCycleView.render(state);
});

appStateView.render(store.state);
topBarView.render(store.state);
store.loadDefault();
