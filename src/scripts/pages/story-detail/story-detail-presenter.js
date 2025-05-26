import Map from "../../utils/map";
import StoryIdb from "../../data/story-idb";

export default class StoryDetailPresenter {
  #view = null;
  #model = null;
  #id = null;
  #map = null;

  constructor({ view, model, id }) {
    this.#view = view;
    this.#model = model;
    this.#id = id;

    this.#initSaveButtonListener();
  }

  #initSaveButtonListener() {
    document.addEventListener('click', async (event) => {
      if (event.target.id === 'btn-save-story') {
        const storyId = event.target.dataset.id;
        const action = event.target.dataset.action;
        
        if (storyId) {
          if (action === 'save') {
            await this.#handleSaveStory(storyId);
          } else if (action === 'unsave') {
            await this.#handleUnsaveStory(storyId);
          }
        }
      }
    });
  }

  async init() {
    try {
      this.#view.showLoading();

      const response = await this.#model.getStoryDetail(this.#id);

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      // Cek apakah cerita sudah tersimpan di IndexedDB
      const savedStory = await StoryIdb.getStoryById(this.#id);
      const isStorySaved = !!savedStory;

      this.#view.showStoryDetail(response.story, isStorySaved);
      
      if (response.story.lat && response.story.lon) {
        await this.#initializeMap(response.story);
      }

      this.#view.hideLoading();
    } catch (error) {
      console.error(error);
      this.#view.showError("Terjadi kesalahan saat memuat detail cerita");
    }
  }

  async #handleSaveStory(storyId) {
    try {
      console.log('Mencoba menyimpan cerita dengan ID:', storyId);
      
      const response = await this.#model.getStoryDetail(storyId);
      
      if (response.error) {
        throw new Error(response.message);
      }

      // Simpan cerita ke IndexedDB
      await StoryIdb.saveStory(response.story);
      console.log('Cerita berhasil disimpan:', response.story);
      
      // Update UI untuk menampilkan tombol unsave
      this.#view.showStoryDetail(response.story, true);
      this.#view.showNotification('Cerita berhasil disimpan dan dapat diakses secara offline');
    } catch (error) {
      console.error('Gagal menyimpan cerita:', error);
      this.#view.showError('Gagal menyimpan cerita. Silakan coba lagi.');
    }
  }

  async #handleUnsaveStory(storyId) {
    try {
      console.log('Mencoba menghapus cerita dengan ID:', storyId);
      
      // Hapus cerita dari IndexedDB
      await StoryIdb.deleteStory(storyId);
      console.log('Cerita berhasil dihapus dari penyimpanan');

      // Ambil data cerita dari API untuk ditampilkan kembali
      const response = await this.#model.getStoryDetail(storyId);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      // Update UI untuk menampilkan tombol save
      this.#view.showStoryDetail(response.story, false);
      this.#view.showNotification('Cerita berhasil dihapus dari penyimpanan offline');
    } catch (error) {
      console.error('Gagal menghapus cerita:', error);
      this.#view.showError('Gagal menghapus cerita. Silakan coba lagi.');
    }
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
