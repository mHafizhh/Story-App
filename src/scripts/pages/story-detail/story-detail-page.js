import AuthService from "../../data/auth-service";
import StoryDetailPresenter from "./story-detail-presenter";
import * as StoryAPI from "../../data/api";
import { parseActivePathname } from "../../routes/url-parser";

export default class StoryDetailPage {
  #presenter = null;

  async render() {
    const isLoggedIn = AuthService.isLoggedIn();
    if (!isLoggedIn) {
      window.location.hash = "#/login";
      return "";
    }

    return `
      <a href="#" class="skip-link">Langsung ke konten utama</a>

      <main id="mainContent">
        <section class="container story-detail-container" aria-labelledby="pageTitle">
          <h1 id="pageTitle" class="page-title">Detail Cerita</h1>
          
          <div id="story-detail" class="story-detail">
            <div class="loading-spinner" role="status">
              <div class="spinner" aria-hidden="true"></div>
              <p>Memuat detail cerita...</p>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    
    this.#presenter = new StoryDetailPresenter({
      view: {
        container: document.querySelector("#story-detail"),
        showLoading: () => {
          this.#showLoading();
        },
        hideLoading: () => {
          this.#hideLoading();
        },
        showStoryDetail: (story, isStorySaved) => {
          this.#showStoryDetail(story, isStorySaved);
        },
        showError: (message) => {
          this.#showError(message);
        },
        updateSaveButtonState: (isSaved) => {
          this.#updateSaveButtonState(isSaved);
        },
        showNotification: (message) => {
          this.#showNotification(message);
        }
      },
      model: StoryAPI,
      id,
    });

    await this.#presenter.init();
  }

  #showLoading() {
    const container = document.querySelector("#story-detail");
    if (!container) return;

    container.innerHTML = `
      <div class="loading-spinner" role="status">
        <div class="spinner" aria-hidden="true"></div>
        <p>Memuat detail cerita...</p>
      </div>
    `;
  }

  #hideLoading() {
    const loadingElement = document.querySelector(".loading-spinner");
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  #showStoryDetail(story, isStorySaved) {
    const container = document.querySelector("#story-detail");
    if (!container) return;

    const hasLocation = story.lat && story.lon;
    
    container.innerHTML = `
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
          <div class="story-detail-actions">
            <button 
              id="btn-save-story"
              class="btn-save ${isStorySaved ? 'saved' : ''}"
              aria-label="${isStorySaved ? 'Hapus cerita dari tersimpan' : 'Simpan cerita ini'}"
              data-id="${story.id}"
              data-action="${isStorySaved ? 'unsave' : 'save'}"
            >
              ${isStorySaved ? '🗑️ Hapus dari Tersimpan' : '💾 Simpan Cerita'}
            </button>
            <a href="#/" class="btn-back">Kembali ke Beranda</a>
          </div>
        </div>
      </article>
    `;
  }

  #showError(message) {
    const container = document.querySelector("#story-detail");
    if (!container) return;

    container.innerHTML = `
      <div class="error-message" role="alert">
        <p>${message}</p>
        <a href="#/" class="btn-back" aria-label="Kembali ke halaman beranda">Kembali ke Beranda</a>
      </div>
    `;
  }

  #updateSaveButtonState(isSaved) {
    const saveButton = document.getElementById('btn-save-story');
    if (!saveButton) return;

    saveButton.textContent = isSaved ? '✓ Tersimpan' : '💾 Simpan Cerita';
    saveButton.disabled = isSaved;
    if (isSaved) {
      saveButton.classList.add('saved');
    } else {
      saveButton.classList.remove('saved');
    }
  }

  #showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Story App', {
        body: message,
        icon: '/icons/icon-192x192.png',
      });
    }
  }

  destroy() {
    this.#presenter?.destroy();
  }
}
