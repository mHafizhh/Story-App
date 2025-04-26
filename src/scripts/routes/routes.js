import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import NotFoundPage from "../pages/not-found-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
};

export default routes;

// Fungsi untuk mendapatkan halaman berdasarkan route
export function getPage(route) {
  return routes[route] || new NotFoundPage();
}
