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
      },
      model: StoryAPI,
      id,
    });

    await this.#presenter.init();
  }

  destroy() {
    this.#presenter?.destroy();
  }
}
