import showToast from "../../utils/toast";

export default class AddStoryPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async submitStory() {
    const { description, photoPreview } = this.#view.getFormData();

    if (!description) {
      this.#view.showError("Deskripsi tidak boleh kosong");
      return;
    }

    if (!photoPreview.src || photoPreview.style.display === "none") {
      this.#view.showError("Harap ambil foto terlebih dahulu");
      return;
    }

    try {
      this.#view.showLoading();
      this.#view.clearError();

      const photo = await this.#view.getPhotoFile();
      const result = await this.#model.addStory({
        description,
        photo,
      });

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      showToast("Cerita berhasil ditambahkan!");
      window.location.hash = "#/";
    } catch (error) {
      this.#view.showError("Terjadi kesalahan saat menambahkan cerita");
      console.error(error);
    } finally {
      this.#view.hideLoading();
    }
  }

  async startCamera() {
    const success = await this.#view.startCameraStream();
    if (success) {
      this.#view.updateCameraUI({ showCamera: true });
    }
  }

  stopCamera() {
    this.#view.stopCameraStream();
    this.#view.updateCameraUI();
  }

  capturePhoto() {
    this.#view.capturePhotoFromCamera();
    this.#view.updateCameraUI({ showPreview: true });
  }

  retakePhoto() {
    this.#view.updateCameraUI({ showCamera: true });
  }
} 