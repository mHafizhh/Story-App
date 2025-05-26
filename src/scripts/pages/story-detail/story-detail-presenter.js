import Map from "../../utils/map";

export default class StoryDetailPresenter {
  #view = null;
  #model = null;
  #id = null;
  #map = null;

  constructor({ view, model, id }) {
    this.#view = view;
    this.#model = model;
    this.#id = id;
  }

  async init() {
    try {
      const response = await this.#model.getStoryDetail(this.#id);

      if (response.error) {
        this.#showError(response.message);
        return;
      }

      this.#showStoryDetail(response.story);
      
      if (response.story.lat && response.story.lon) {
        await this.#initializeMap(response.story);
      }
    } catch (error) {
      this.#showError("Terjadi kesalahan saat memuat detail cerita");
      console.error(error);
    }
  }

  #showStoryDetail(story) {
    const hasLocation = story.lat && story.lon;
    
    this.#view.container.innerHTML = `
      <article class="story-detail-card" aria-labelledby="story-title">
        <img 
          src="${story.photoUrl}" 
          alt="Foto cerita oleh ${story.name}" 
          class="story-detail-image"
          loading="lazy"
        />
        <div class="story-detail-content">
          <h2 id="story-title">${story.name}</h2>
          <p class="story-detail-date" role="contentinfo" aria-label="Tanggal dibuat">
            ${new Date(story.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p class="story-detail-description">${story.description}</p>
          ${hasLocation ? `
            <div class="story-detail-location" role="complementary" aria-labelledby="location-title">
              <h3 id="location-title">Lokasi</h3>
              <div 
                id="story-detail-map" 
                class="story-detail-map"
                role="application" 
                aria-label="Peta lokasi cerita"
              ></div>
              <p class="story-detail-coordinates" aria-label="Koordinat lokasi">
                <span class="sr-only">Koordinat:</span>
                📍 ${story.lat}, ${story.lon}
              </p>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  async #initializeMap(story) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (this.#map) {
        this.#map.destroy();
        this.#map = null;
      }

      const mapContainer = document.getElementById('story-detail-map');
      if (!mapContainer) return;

      this.#map = new Map('#story-detail-map', {
        center: [story.lat, story.lon],
        zoom: 15,
      });

      this.#map.addMarker([story.lat, story.lon], {
        draggable: false,
        title: `Lokasi cerita oleh ${story.name}`,
      }, {
        content: `<p>Lokasi cerita oleh ${story.name}</p>`
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  #showError(message) {
    this.#view.container.innerHTML = `
      <div class="error-message" role="alert">
        <p>${message}</p>
        <a href="#/" class="btn-back" aria-label="Kembali ke halaman beranda">Kembali ke Beranda</a>
      </div>
    `;
  }

  destroy() {
    try {
      if (this.#map) {
        this.#map.destroy();
        this.#map = null;
      }
    } catch (error) {
      console.error('Error destroying map:', error);
    }
  }
}
