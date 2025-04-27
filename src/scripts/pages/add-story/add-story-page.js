import AuthService from "../../data/auth-service";
import showToast from "../../utils/toast";
import AddStoryPresenter from "./add-story-presenter";
import * as StoryAPI from "../../data/api";
import Map from "../../utils/map";

export default class AddStoryPage {
  #presenter = null;
  #mediaStream = null;
  #map = null;

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
                <video 
                  id="camera" 
                  autoplay 
                  playsinline 
                  style="display: none;"
                  aria-label="Preview kamera"
                ></video>
                <canvas id="photoCanvas" style="display: none;" aria-hidden="true"></canvas>
                <img 
                  id="photoPreview" 
                  style="display: none; max-width: 100%; border-radius: 8px;" 
                  alt="Preview foto yang diambil"
                  aria-live="polite"
                >
                
                <div class="photo-input-container">
                  <input 
                    type="file" 
                    id="photoInput" 
                    accept="image/*" 
                    class="photo-input" 
                    aria-label="Pilih foto dari perangkat"
                  >
                  <label for="photoInput" class="photo-input-label">
                    Pilih Foto dari Perangkat
                  </label>
                  <div class="photo-input-separator">atau</div>
                </div>

                <div class="camera-buttons" role="toolbar" aria-label="Kontrol kamera">
                  <button 
                    type="button" 
                    id="startCamera" 
                    class="btn-secondary"
                    aria-label="Buka kamera untuk mengambil foto"
                  >Buka Kamera</button>
                  <button 
                    type="button" 
                    id="capturePhoto" 
                    class="btn-secondary" 
                    style="display: none;"
                    aria-label="Ambil foto dari kamera"
                  >Ambil Foto</button>
                  <button 
                    type="button" 
                    id="retakePhoto" 
                    class="btn-secondary" 
                    style="display: none;"
                    aria-label="Ambil ulang foto"
                  >Ambil Ulang</button>
                  <button 
                    type="button" 
                    id="stopCamera" 
                    class="btn-secondary" 
                    style="display: none;"
                    aria-label="Tutup kamera"
                  >Tutup Kamera</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label id="locationLabel" class="form-label">Lokasi</label>
              <div class="location-container" role="region" aria-labelledby="locationLabel">
                <div id="map" class="map-container"></div>
                <div class="location-coordinates">
                  <div class="coordinate-input">
                    <label for="latitude" class="form-label">Latitude</label>
                    <input 
                      type="text" 
                      id="latitude" 
                      name="latitude"
                      readonly
                      aria-label="Latitude koordinat yang dipilih"
                    >
                  </div>
                  <div class="coordinate-input">
                    <label for="longitude" class="form-label">Longitude</label>
                    <input 
                      type="text" 
                      id="longitude" 
                      name="longitude"
                      readonly
                      aria-label="Longitude koordinat yang dipilih"
                    >
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              class="btn-submit"
              aria-label="Kirim cerita baru"
            >Tambah Cerita</button>
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

    this.#initializeForm();
    this.#initializeCamera();
    await this.#initializeMap();
    this.#initializeCleanup();
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
    const photoInput = document.getElementById("photoInput");

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

    photoInput.addEventListener("change", (event) => {
      this.#presenter.handleFileSelect(event);
    });
  }

  async handleFileSelect(file) {
    const photoPreview = document.getElementById("photoPreview");
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        photoPreview.src = e.target.result;
        this.updateCameraUI({ showPreview: true });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("Gagal membaca file", "error");
    }
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
    const latitude = parseFloat(document.getElementById("latitude").value) || 0;
    const longitude = parseFloat(document.getElementById("longitude").value) || 0;
    
    return {
      description,
      photoPreview,
      lat: latitude,
      lon: longitude,
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
      this.stopCameraStream();
      return false;
    }
  }

  stopCameraStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => {
        track.stop();
        this.#mediaStream.removeTrack(track);
      });
      this.#mediaStream = null;

      const cameraElement = document.getElementById("camera");
      if (cameraElement) {
        cameraElement.srcObject = null;
        cameraElement.load();
      }

      this.updateCameraUI({ showCamera: false, showPreview: false });
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

  async #initializeMap() {
    try {
      this.#map = await Map.build('#map', {
        zoom: 15,
        locate: true,
      });

      const centerCoordinate = this.#map.getCenter();
      this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

      const draggableMarker = this.#map.addMarker(
        [centerCoordinate.latitude, centerCoordinate.longitude],
        { draggable: true }
      );

      draggableMarker.on('move', (event) => {
        const coordinate = event.target.getLatLng();
        this.#updateLatLngInput(coordinate.lat, coordinate.lng);
      });

      this.#map.addMapEventListener('click', (event) => {
        const { lat, lng } = event.latlng;
        draggableMarker.setLatLng([lat, lng]);
        this.#updateLatLngInput(lat, lng);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      showToast('Gagal memuat peta', 'error');
    }
  }

  #updateLatLngInput(latitude, longitude) {
    document.getElementById('latitude').value = latitude.toFixed(6);
    document.getElementById('longitude').value = longitude.toFixed(6);
  }

  #updateLocationInfo(latitude, longitude) {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.textContent = `Lokasi dipilih: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  #initializeCleanup() {
    window.addEventListener('hashchange', () => {
      this.destroy();
    });

    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  destroy() {
    this.stopCameraStream();
    
    window.removeEventListener('hashchange', () => this.destroy());
    window.removeEventListener('beforeunload', () => this.destroy());
    
    this.#mediaStream = null;
    this.#presenter = null;
  }
} 