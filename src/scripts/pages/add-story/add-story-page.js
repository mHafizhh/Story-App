import AuthService from "../../data/auth-service";
import showToast from "../../utils/toast";
import AddStoryPresenter from "./add-story-presenter";
import * as StoryAPI from "../../data/api";
import Map from "../../utils/map";
import Camera from "../../utils/camera";

export default class AddStoryPage {
  #presenter = null;
  #form = null;
  #camera = null;
  #isCameraOpen = false;
  #takenPhotos = [];
  #map = null;
  #marker = null;
  #isLoading = false;

  async render() {
    const isLoggedIn = AuthService.isLoggedIn();
    if (!isLoggedIn) {
      window.location.hash = "#/login";
      return "";
    }

    return `
      <!-- Skip to content -->
      <a href="#mainContent" class="skip-link">Langsung ke konten utama</a>

      <main id="mainContent">
        <section class="container auth-container" aria-labelledby="pageTitle">
          <h1 id="pageTitle" class="auth-title">Tambah Cerita</h1>
          
          <div id="errorContainer" class="error-container" role="alert" aria-live="polite"></div>
          
          <form id="addStoryForm" class="auth-form">
            <div class="form-group">
              <label for="description" class="form-label">Deskripsi</label>
              <textarea 
                id="description" 
                name="description" 
                rows="4" 
                required
                placeholder="Ceritakan pengalamanmu..."
                aria-required="true"
                aria-describedby="descriptionHint"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label id="photoLabel" class="form-label">Foto</label>
              <div class="camera-container" role="region" aria-labelledby="photoLabel">
                <div class="camera-preview-container">
                  <video 
                    id="camera-preview" 
                    class="camera-preview"
                    autoplay 
                    playsinline
                    style="display: none;"
                  >
                    Browser Anda tidak mendukung video.
                  </video>
                  <canvas 
                    id="camera-canvas" 
                    class="camera-canvas"
                    style="display: none;"
                  ></canvas>
                </div>

                <div class="camera-controls">
                  <div class="camera-buttons">
                    <button 
                      type="button" 
                      id="toggle-camera-button" 
                      class="btn-outline"
                    >
                      <i class="fas fa-camera"></i>
                      Buka Kamera
                    </button>
                    <button 
                      type="button" 
                      id="capture-photo-button" 
                      class="btn-outline"
                      disabled
                    >
                      <i class="fas fa-circle"></i>
                      Ambil Foto
                    </button>
                    <button 
                      type="button"
                      class="btn-outline"
                      onclick="document.getElementById('file-input').click()"
                    >
                      <i class="fas fa-image"></i>
                      Pilih dari Device
                    </button>
                    <input
                      type="file"
                      id="file-input"
                      accept="image/*"
                      class="file-input"
                      hidden
                      aria-label="Pilih foto dari device"
                    >
                  </div>
                  
                  <select id="camera-select" class="camera-select">
                    <option value="">Pilih Kamera</option>
                  </select>
                </div>

                <div class="photo-preview-container">
                  <ul id="photo-preview-list" class="photo-preview-list"></ul>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label id="locationLabel" class="form-label">Lokasi</label>
              <div class="location-container" role="region" aria-labelledby="locationLabel">
                <div class="new-form__location__map__container">
                  <div id="map" class="map-container"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" value="-6.175389" disabled>
                  <input type="number" name="longitude" value="106.827139" disabled>
                </div>
              </div>
            </div>
            
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn-submit" type="submit">Tambah Cerita</button>
              </span>
            </div>
          </form>
        </section>
      </main>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoryAPI,
    });
    
    this.#form = document.getElementById('addStoryForm');
    if (!this.#form) {
      console.error('Form element not found');
      return;
    }

    this.#takenPhotos = [];

    this.#setupForm();
    this.#setupCamera();
    
    await this.#presenter.showNewFormMap();
  }

  #setupForm() {
    if (!this.#form) return;

    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#getFirstPhoto()?.blob,
        lat: parseFloat(this.#form.elements.namedItem('latitude').value),
        lon: parseFloat(this.#form.elements.namedItem('longitude').value),
      };
      await this.#presenter.handleFormSubmit(formData);
    });
  }

  #getFirstPhoto() {
    const photos = this.#presenter.getPhotos();
    return photos && photos.length > 0 ? photos[0] : null;
  }

  #setupCamera() {
    const videoElement = document.getElementById('camera-preview');
    const cameraSelect = document.getElementById('camera-select');
    const canvasElement = document.getElementById('camera-canvas');
    const toggleCameraButton = document.getElementById('toggle-camera-button');
    const capturePhotoButton = document.getElementById('capture-photo-button');
    const fileInput = document.getElementById('file-input');

    this.#camera = new Camera({
      video: videoElement,
      cameraSelect: cameraSelect,
      canvas: canvasElement,
    });

    toggleCameraButton.addEventListener('click', () => {
      this.#presenter.handleCameraToggle();
    });

    capturePhotoButton.addEventListener('click', () => {
      this.#presenter.handleCapturePhoto();
    });

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (file) {
        this.#presenter.handleFileSelect(file);
        event.target.value = '';
      }
    });
  }

  async initialMap() {
    try {
      const map = await Map.build('#map', {
        zoom: 15,
        locate: true,
      });
      return map;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;

    const latInput = this.#form.querySelector('input[name="latitude"]');
    const lngInput = this.#form.querySelector('input[name="longitude"]');
    
    if (latInput && lngInput) {
      latInput.value = latitude.toFixed(6);
      lngInput.value = longitude.toFixed(6);
    }
  }

  async launchCamera() {
    return this.#camera.launch();
  }

  stopCamera() {
    this.#camera.stop();
  }

  async takePicture() {
    return this.#camera.takePicture();
  }

  updateCameraUI({ isOpen, buttonText, showVideo, enableCapture }) {
    const toggleCameraButton = document.getElementById('toggle-camera-button');
    const videoElement = document.getElementById('camera-preview');
    const capturePhotoButton = document.getElementById('capture-photo-button');

    if (toggleCameraButton) toggleCameraButton.innerHTML = buttonText;
    if (videoElement) videoElement.style.display = showVideo ? 'block' : 'none';
    if (capturePhotoButton) capturePhotoButton.disabled = !enableCapture;
  }

  async updatePhotoPreview(photos) {
    const previewList = document.getElementById('photo-preview-list');
    if (!previewList) return;
    
    const html = photos.map((photo, index) => {
      photo.objectUrl = URL.createObjectURL(photo.blob);
      return `
        <li class="photo-preview-item">
          <div class="photo-preview-wrapper">
            <img src="${photo.objectUrl}" alt="Foto ${index + 1}" class="photo-preview-image">
            <button 
              type="button" 
              class="photo-delete-button" 
              data-photo-id="${photo.id}"
              aria-label="Hapus foto ${index + 1}"
            >
              ×
            </button>
          </div>
        </li>
      `;
    }).join('');

    previewList.innerHTML = html;

    previewList.querySelectorAll('.photo-delete-button').forEach(button => {
      button.addEventListener('click', () => {
        const photoId = button.dataset.photoId;
        this.#presenter.removePhoto(photoId);
      });
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

  storeSuccessfully(message) {
    showToast(message);
    this.clearForm();
    window.location.hash = "#/";
  }

  storeFailed(message) {
    this.showError(message);
  }

  clearForm() {
    this.#form.reset();
    this.updatePhotoPreview([]);
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    `;
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn-submit loading" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Tambah Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn-submit" type="submit">Tambah Cerita</button>
    `;
  }

  destroy() {
    this.#presenter.destroy();
    this.#camera = null;
    this.#form = null;
  }
} 