export default class HomePresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async init() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getStories();

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      const { listStory } = response;
      this.#view.showStories(listStory);
    } catch (error) {
      console.error(error);
      this.#view.showError(`Gagal memuat cerita. ${error.message}`);
    } finally {
      this.#view.hideLoading();
    }
  }
} 