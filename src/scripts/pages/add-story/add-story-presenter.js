import showToast from "../../utils/toast";

export default class AddStoryPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async submitStory(data) {
    this.#view.showSubmitLoadingButton();
    try {
      const result = await this.#model.addStory(data);

      if (result.error) {
        this.#view.storeFailed(result.message);
        return;
      }

      this.#view.storeSuccessfully(result.message);
    } catch (error) {
      console.error('submitStory: error:', error);
      this.#view.storeFailed("Terjadi kesalahan saat menambahkan cerita");
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async startCamera() {
    const success = await this.#view.startCameraStream();
    if (success) {
      this.#view.updateCameraUI({ showCamera: true });
    }
  }

  stopCamera() {
    // Pastikan stream dibersihkan
    this.#view.stopCameraStream();
    
    // Update UI setelah stream dibersihkan
    this.#view.updateCameraUI({ showCamera: false, showPreview: false });
  }

  capturePhoto() {
    this.#view.capturePhotoFromCamera();
    this.#view.updateCameraUI({ showPreview: true });
  }

  retakePhoto() {
    this.#view.updateCameraUI({ showCamera: true });
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.#view.showError('Mohon pilih file gambar yang valid');
      return;
    }

    this.#view.handleFileSelect(file);
  }
} 