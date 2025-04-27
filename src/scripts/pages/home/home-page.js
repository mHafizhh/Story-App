import AuthService from "../../data/auth-service";
import { createItemTemplate } from "../templates/item-template";
import HomePresenter from "./home-presenter";
import * as StoryAPI from "../../data/api";

export default class HomePage {
  #presenter = null;

  async render() {
    const isLoggedIn = AuthService.isLoggedIn();
    const userInfo = isLoggedIn ? AuthService.getUserInfo() : null;

    return `
      <section class="container">
        <h1 class="page-title">Dicoding Story</h1>
        
        ${
          isLoggedIn
            ? `
            <div class="welcome-card">
              <h2>Selamat Datang, ${userInfo.name}!</h2>
              <p>Berikut adalah cerita dari pengguna Dicoding.</p>
            </div>

            <div id="story-container" class="story-container">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Mengambil data cerita...</p>
              </div>
            </div>
          `
            : `
            <div class="welcome-card">
              <h2>Selamat Datang di Dicoding Story</h2>
              <p>Silahkan <a href="#/login">login</a> atau <a href="#/register">register</a> untuk melihat cerita dari pengguna Dicoding.</p>
            </div>
          `
        }
      </section>
    `;
  }

  async afterRender() {
    const isLoggedIn = AuthService.isLoggedIn();
    
    if (isLoggedIn) {
      this.#presenter = new HomePresenter({
        view: this,
        model: StoryAPI,
      });
      
      // Pastikan container sudah ada sebelum memanggil init
      const storyContainer = document.getElementById("story-container");
      if (storyContainer) {
        await this.#presenter.init();
      } else {
        console.error("Story container tidak ditemukan");
      }
    }
  }

  showLoading() {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;

    storyContainer.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Mengambil data cerita...</p>
      </div>
    `;
  }

  hideLoading() {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;
    
    // Jangan langsung mengosongkan container
    // storyContainer.innerHTML = '';
  }

  showStories(stories) {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;

    if (stories.length === 0) {
      storyContainer.innerHTML = '<div class="empty-state">Belum ada cerita yang tersedia. Jadilah yang pertama berbagi cerita!</div>';
      return;
    }

    const storiesHtml = stories.map((story) => createItemTemplate(story)).join("");
    storyContainer.innerHTML = `<div class="story-list">${storiesHtml}</div>`;
  }

  showError(message) {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;
    
    storyContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }
}
