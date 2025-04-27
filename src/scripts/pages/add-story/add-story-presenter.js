import showToast from "../../utils/toast";

export default class AddStoryPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async submitStory() {
    const { description, photoPreview, lat, lon } = this.#view.getFormData();

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
        lat,
        lon,
      });

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      showToast("Cerita berhasil ditambahkan!");
      
      // Pastikan resources dibersihkan sebelum navigasi
      this.#view.destroy();
      
      // Tunggu sebentar untuk memastikan cleanup selesai
      await new Promise(resolve => setTimeout(resolve, 100));
      
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