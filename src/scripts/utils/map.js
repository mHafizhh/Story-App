import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export default class Map {
  #zoom = 13;
  #map = null;

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  createIcon(options = {}) {
    return L.icon({
      ...L.Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }
    
    const newMarker = L.marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });
    
    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }
      const newPopup = L.popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }
    
    newMarker.addTo(this.#map);
    return newMarker;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API tidak didukung');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);
        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    this.#map = L.map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: true,
      layers: [tileOsm],
      ...options,
    });
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
} 