import { getActiveRoute } from "../routes/url-parser";
import { getPage } from "../routes/routes";
import AuthService from "../data/auth-service";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #navList = null;
  #loginLink = null;
  #registerLink = null;
  #userInfo = null;
  #logoutButton = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content, navList }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = navList;

    this.#loginLink = document.querySelector(".login-link");
    this.#registerLink = document.querySelector(".register-link");
    this.#userInfo = document.querySelector(".user-info");
    this.#logoutButton = document.querySelector("#logout-button");

    this.#setupDrawer();
    this.#setupAuthNavigation();
    this.#setupSkipToContent();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupAuthNavigation() {
    this.#updateNavigation();

    this.#logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      AuthService.destroyAuth();
      window.location.hash = "#/";
      this.#updateNavigation();
      await this.renderPage();
    });

    window.addEventListener("hashchange", () => {
      this.#updateNavigation();
    });
  }

  #setupSkipToContent() {
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('skip-link')) {
        event.preventDefault();
        const mainContent = document.querySelector('#mainContent');
        if (mainContent) {
          mainContent.tabIndex = -1;
          mainContent.focus();
          mainContent.scrollIntoView();
        }
      }
    });
  }

  #updateNavigation() {
    const isLoggedIn = AuthService.isLoggedIn();

    if (isLoggedIn) {
      if (this.#loginLink) {
        this.#loginLink.style.display = "none";
      }
      if (this.#registerLink) {
        this.#registerLink.style.display = "none";
      }
      if (this.#userInfo) {
        this.#userInfo.style.display = "block";
      }
      if (this.#logoutButton && this.#logoutButton.parentElement) {
        this.#logoutButton.parentElement.style.display = "block";
      }
    } else {
      if (this.#loginLink) {
        this.#loginLink.style.display = "block";
      }
      if (this.#registerLink) {
        this.#registerLink.style.display = "block";
      }
      if (this.#userInfo) {
        this.#userInfo.style.display = "none";
      }
      if (this.#logoutButton && this.#logoutButton.parentElement) {
        this.#logoutButton.parentElement.style.display = "none";
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = getPage(url);

    if (this.#currentPage && typeof this.#currentPage.destroy === 'function') {
      this.#currentPage.destroy();
    }

    this.#currentPage = page;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;
