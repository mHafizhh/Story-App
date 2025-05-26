import StoryIdb from '../../data/story-idb';

class HomePresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async init() {
    try {
      this.#view.showLoading();
      
      const response = await this.#model.getStories();
      
      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      if (response.listStory.length === 0) {
        this.#view.showEmpty();
        return;
      }

      this.#view.showStories(response.listStory);
    } catch (error) {
      console.error(error);
      this.#view.showError('Terjadi kesalahan saat memuat cerita');
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default HomePresenter; 