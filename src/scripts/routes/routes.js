import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import StoryDetailPage from "../pages/story-detail/story-detail-page";
import NotFoundPage from "../pages/not-found-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add": new AddStoryPage(),
  "/story/:id": new StoryDetailPage(),
};

export default routes;

// Fungsi untuk mendapatkan halaman berdasarkan route
export function getPage(route) {
  return routes[route] || new NotFoundPage();
}
