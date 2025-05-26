import AuthService from "../../data/auth-service";
import { createItemTemplate } from "../templates/item-template";
import HomePresenter from "./home-presenter";
import * as StoryAPI from "../../data/api";
import PushNotificationHelper from "../../utils/push-notification-helper";

export default class HomePage {
  #presenter = null;

  async render() {
    const isLoggedIn = AuthService.isLoggedIn();
    const userInfo = isLoggedIn ? AuthService.getUserInfo() : null;

    return `
      <a href="#" class="skip-link">Langsung ke konten utama</a>

      <main id="mainContent">
        <section class="container" aria-labelledby="pageTitle">
          <h1 id="pageTitle" class="page-title">Story App</h1>
          
          ${
            isLoggedIn
              ? `
              <div class="welcome-card" role="region" aria-label="Informasi selamat datang">
                <h2>Selamat Datang, ${userInfo.name}!</h2>
                <p>Berikut adalah cerita dari para pengguna.</p>
                <button 
                  id="subscribeButton" 
                  class="btn-subscribe"
                  aria-label="Tombol berlangganan notifikasi"
                >
                  Subscribe Push Notification
                </button>
              </div>

              <div 
                id="story-container" 
                class="story-container" 
                role="feed" 
                aria-busy="true"
                aria-label="Daftar cerita pengguna"
              >
                <div class="loading-spinner" role="status">
                  <div class="spinner" aria-hidden="true"></div>
                  <p>Mengambil data cerita...</p>
                </div>
              </div>
            `
              : `
              <div class="welcome-card" role="region" aria-label="Informasi selamat datang">
                <h2>Selamat Datang di Story App</h2>
                <p>Silahkan <a href="#/login" aria-label="Masuk ke akun">login</a> atau <a href="#/register" aria-label="Daftar akun baru">register</a> untuk melihat cerita dari pengguna Dicoding.</p>
              </div>
            `
          }
        </section>
      </main>
    `;
  }

  async afterRender() {
    const isLoggedIn = AuthService.isLoggedIn();
    
    if (isLoggedIn) {
      this.#presenter = new HomePresenter({
        view: this,
        model: StoryAPI,
      });
      
      const storyContainer = document.getElementById("story-container");
      if (storyContainer) {
        await this.#presenter.init();
      } else {
        console.error("Story container tidak ditemukan");
      }

      // Initialize Push Notification
      const subscribeButton = document.getElementById('subscribeButton');
      if (subscribeButton) {
        await PushNotificationHelper.init({ subscribeButton });
      }
    }
  }

  showLoading() {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;

    storyContainer.setAttribute("aria-busy", "true");
    storyContainer.innerHTML = `
      <div class="loading-spinner" role="status">
        <div class="spinner" aria-hidden="true"></div>
        <p>Mengambil data cerita...</p>
      </div>
    `;
  }

  hideLoading() {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;
    storyContainer.setAttribute("aria-busy", "false");
  }

  showStories(stories) {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;

    if (stories.length === 0) {
      storyContainer.innerHTML = '<div class="empty-state" role="status">Belum ada cerita yang tersedia. Jadilah yang pertama berbagi cerita!</div>';
      return;
    }

    const storiesHtml = stories.map((story) => createItemTemplate(story)).join("");
    storyContainer.innerHTML = `<div class="story-list" role="feed" aria-label="Daftar cerita">${storiesHtml}</div>`;
  }

  showError(message) {
    const storyContainer = document.getElementById("story-container");
    if (!storyContainer) return;
    
    storyContainer.innerHTML = `<div class="error-message" role="alert">${message}</div>`;
  }
}
