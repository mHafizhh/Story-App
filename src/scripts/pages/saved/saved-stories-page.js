import StoryIdb from '../../data/story-idb';
import { createItemTemplate } from '../templates/item-template';

export default class SavedStoriesPage {
  #storyContainer = null;

  async render() {
    return `
      <main id="mainContent">
        <section class="container" aria-labelledby="pageTitle">
          <h1 id="pageTitle" class="page-title">Cerita Tersimpan</h1>
          
          <div 
            id="story-container" 
            class="story-container" 
            role="feed" 
            aria-busy="true"
            aria-label="Daftar cerita tersimpan"
          >
            <div class="loading-spinner" role="status">
              <div class="spinner" aria-hidden="true"></div>
              <p>Mengambil data cerita tersimpan...</p>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    this.#storyContainer = document.getElementById('story-container');
    await this.#showSavedStories();
  }

  async #showSavedStories() {
    try {
      const stories = await StoryIdb.getAllStories();
      
      if (stories.length === 0) {
        this.#showEmptyMessage();
        return;
      }
      
      this.#showStories(stories);
    } catch (error) {
      console.error('Gagal memuat cerita tersimpan:', error);
      this.#showError('Gagal memuat cerita tersimpan');
    }
  }

  #showStories(stories) {
    this.#storyContainer.innerHTML = '';
    stories.forEach((story) => {
      const storyElement = createItemTemplate(story);
      this.#storyContainer.insertAdjacentHTML('beforeend', storyElement);
    });
  }

  #showEmptyMessage() {
    this.#storyContainer.innerHTML = `
      <div class="empty-state">
        <p>Belum ada cerita yang disimpan</p>
        <a href="#/" class="btn">Kembali ke Beranda</a>
      </div>
    `;
  }

  #showError(message) {
    this.#storyContainer.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
        <button class="btn" onclick="window.location.reload()">Coba Lagi</button>
      </div>
    `;
  }
} 