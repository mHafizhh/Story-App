export default class SavedStoriesPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showSavedStories() {
    try {
      this.#view.showLoading();
      const stories = await this.#model.getAllStories();
      
      if (stories.length === 0) {
        this.#view.showEmptyState();
        return;
      }

      this.#view.showStories(stories);
    } catch (error) {
      console.error('Error:', error);
      this.#view.showError('Gagal memuat data cerita tersimpan');
    } finally {
      this.#view.hideLoading();
    }
  }
} 