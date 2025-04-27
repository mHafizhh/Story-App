import AuthService from "../../data/auth-service";
import showToast from "../../utils/toast";
import AddStoryPresenter from "./add-story-presenter";
import * as StoryAPI from "../../data/api";

export default class AddStoryPage {
  #presenter = null;
  #mediaStream = null;

  async render() {
    const isLoggedIn = AuthService.isLoggedIn();
    if (!isLoggedIn) {
      window.location.hash = "#/login";
      return "";
    }

    return `
      <section class="container auth-container">
        <h1 class="auth-title">Tambah Cerita</h1>
        
        <div id="errorContainer" class="error-container"></div>
        
        <form id="addStoryForm" class="auth-form">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea 
              id="description" 
              name="description" 
              rows="4" 
              required
              placeholder="Ceritakan pengalamanmu..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Foto</label>
            <div class="camera-container">
              <video id="camera" autoplay playsinline style="display: none;"></video>
              <canvas id="photoCanvas" style="display: none;"></canvas>
              <img id="photoPreview" style="display: none; max-width: 100%; border-radius: 8px;" alt="Preview foto">
              
              <div class="camera-buttons">
                <button type="button" id="startCamera" class="btn-secondary">Buka Kamera</button>
                <button type="button" id="capturePhoto" class="btn-secondary" style="display: none;">Ambil Foto</button>
                <button type="button" id="retakePhoto" class="btn-secondary" style="display: none;">Ambil Ulang</button>
                <button type="button" id="stopCamera" class="btn-secondary" style="display: none;">Tutup Kamera</button>
              </div>
            </div>
          </div>
          
          <button type="submit" class="btn-submit">Tambah Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#initializeForm();
    this.#initializeCamera();
  }

  #initializeForm() {
    const form = document.getElementById("addStoryForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.#presenter.submitStory();
    });
  }

  #initializeCamera() {
    const startCameraButton = document.getElementById("startCamera");
    const capturePhotoButton = document.getElementById("capturePhoto");
    const retakePhotoButton = document.getElementById("retakePhoto");
    const stopCameraButton = document.getElementById("stopCamera");

    startCameraButton.addEventListener("click", async () => {
      await this.#presenter.startCamera();
    });

    stopCameraButton.addEventListener("click", () => {
      this.#presenter.stopCamera();
    });

    capturePhotoButton.addEventListener("click", () => {
      this.#presenter.capturePhoto();
    });

    retakePhotoButton.addEventListener("click", () => {
      this.#presenter.retakePhoto();
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = `<p>${message}</p>`;
  }

  clearError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = "";
  }

  getFormData() {
    const description = document.getElementById("description").value;
    const photoPreview = document.getElementById("photoPreview");
    return {
      description,
      photoPreview,
    };
  }

  showLoading() {
    const submitButton = document.querySelector(".btn-submit");
    submitButton.classList.add("loading");
    submitButton.disabled = true;
  }

  hideLoading() {
    const submitButton = document.querySelector(".btn-submit");
    submitButton.classList.remove("loading");
    submitButton.disabled = false;
  }

  async startCameraStream() {
    const cameraElement = document.getElementById("camera");
    try {
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      cameraElement.srcObject = this.#mediaStream;
      return true;
    } catch (error) {
      console.error("Error accessing camera:", error);
      showToast("Gagal mengakses kamera", "error");
      return false;
    }
  }

  stopCameraStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => track.stop());
      this.#mediaStream = null;
    }
  }

  updateCameraUI({ showCamera = false, showPreview = false }) {
    const cameraElement = document.getElementById("camera");
    const photoPreview = document.getElementById("photoPreview");
    const startCameraButton = document.getElementById("startCamera");
    const capturePhotoButton = document.getElementById("capturePhoto");
    const retakePhotoButton = document.getElementById("retakePhoto");
    const stopCameraButton = document.getElementById("stopCamera");

    cameraElement.style.display = showCamera ? "block" : "none";
    photoPreview.style.display = showPreview ? "block" : "none";
    startCameraButton.style.display = (!showCamera && !showPreview) ? "block" : "none";
    capturePhotoButton.style.display = showCamera ? "block" : "none";
    retakePhotoButton.style.display = showPreview ? "block" : "none";
    stopCameraButton.style.display = (showCamera || showPreview) ? "block" : "none";
  }

  capturePhotoFromCamera() {
    const cameraElement = document.getElementById("camera");
    const photoCanvas = document.getElementById("photoCanvas");
    const photoPreview = document.getElementById("photoPreview");

    photoCanvas.width = cameraElement.videoWidth;
    photoCanvas.height = cameraElement.videoHeight;
    
    const context = photoCanvas.getContext("2d");
    context.drawImage(cameraElement, 0, 0, photoCanvas.width, photoCanvas.height);
    
    photoPreview.src = photoCanvas.toDataURL("image/jpeg");
  }

  async getPhotoFile() {
    const photoPreview = document.getElementById("photoPreview");
    const response = await fetch(photoPreview.src);
    const blob = await response.blob();
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  }
} 