import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import NotFoundPage from './not-found-page';
import { isAuthenticated,logout } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupRouting();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #setupRouting() {
    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || new NotFoundPage();
    const hideHeaderRoutes = ['#/login', '#/register'];
    const header = document.querySelector('header');

    if (hideHeaderRoutes.includes(location.hash)) {
      header.style.display = 'none';
    } else {
      header.style.display = 'block';
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#handleAuthUI();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#handleAuthUI();
    }
  }

  #handleAuthUI() {
    const logoutBtn = document.getElementById('logout-button');
    const loginLink = document.getElementById('login-link');

    const isAuthenticatedUser = isAuthenticated();

    console.log('Is Authenticated:', isAuthenticatedUser);

    if (logoutBtn && loginLink) {
      if (isAuthenticatedUser) {
        logoutBtn.style.display = 'inline-block';
        loginLink.style.display = 'none';
      } else {
        logoutBtn.style.display = 'none';
        loginLink.style.display = 'inline-block';
      }

      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Apakah anda yakin ingin logout?')) {
          logout();
          window.location.hash = '#/login';
          location.reload();
        }
      });
    }
  }
}

export default App;
