/**
 * @typedef {"unsupported" | "permission-denied" | "position-unavailable" | "timeout"} GeolocationFailureCode
 */

export class GeolocationError extends Error {
  /**
   * @param {GeolocationFailureCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "GeolocationError";
    /** @readonly */
    this.code = code;
  }
}

export class BrowserGeolocationProvider {
  /**
   * Obtém as coordenadas atuais usando a API nativa Geolocation do navegador.
   * @returns {Promise<{ latitude: number, longitude: number }>}
   */
  getCurrentCoordinates() {
    if (!("geolocation" in navigator)) {
      return Promise.reject(
        new GeolocationError("unsupported", "Geolocalização não suportada neste navegador.")
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(new GeolocationError("permission-denied", "Permissão de localização negada."));
            return;
          }
          if (error.code === error.TIMEOUT) {
            reject(new GeolocationError("timeout", "Tempo esgotado ao obter sua localização."));
            return;
          }
          reject(
            new GeolocationError(
              "position-unavailable",
              "Não foi possível determinar sua localização."
            )
          );
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }
}
