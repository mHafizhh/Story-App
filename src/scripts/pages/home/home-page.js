import AuthService from "../../data/auth-service";
import { getStories } from "../../data/api";
import { createItemTemplate } from "../templates/item-template";

export default class HomePage {
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
      await this.#fetchStories();
    }
  }

  async #fetchStories() {
    const storyContainer = document.getElementById("story-container");

    try {
      const response = await getStories();

      if (response.error) {
        storyContainer.innerHTML = `<div class="error-message">${response.message}</div>`;
        return;
      }

      const { listStory } = response;

      if (listStory.length === 0) {
        storyContainer.innerHTML = '<div class="empty-state">Belum ada cerita yang tersedia. Jadilah yang pertama berbagi cerita!</div>';
        return;
      }

      const storiesHtml = listStory.map((story) => createItemTemplate(story)).join("");
      storyContainer.innerHTML = `<div class="story-list">${storiesHtml}</div>`;
    } catch (error) {
      console.error(error);
      storyContainer.innerHTML = `<div class="error-message">Gagal memuat cerita. ${error.message}</div>`;
    }
  }
}
