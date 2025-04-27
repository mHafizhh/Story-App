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
    
    // Inisialisasi form terlebih dahulu
    this.#form = document.getElementById('addStoryForm');
    if (!this.#form) {
      console.error('Form element not found');
      return;
    }

    this.#takenPhotos = [];

    // Setup event listeners dan komponen lainnya
    this.#setupForm();
    this.#setupCamera();
    
    // Inisialisasi peta setelah form siap
    await this.#presenter.showNewFormMap();
  }

  #setupForm() {
    if (!this.#form) return;

    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#takenPhotos[0]?.blob, // Mengambil foto pertama saja
        lat: parseFloat(this.#form.elements.namedItem('latitude').value),
        lon: parseFloat(this.#form.elements.namedItem('longitude').value),
      };

      if (!data.description) {
        this.showError("Deskripsi tidak boleh kosong");
        return;
      }

      if (!data.photo) {
        this.showError("Harap ambil foto terlebih dahulu");
        return;
      }

      await this.#presenter.submitStory(data);
    });
  }

  async initialMap() {
    try {
      this.#map = await Map.build('#map', {
        zoom: 15,
        locate: true,
      });

      const centerCoordinate = this.#map.getCenter();
      
      // Inisialisasi marker di posisi awal
      this.#marker = this.#map.addMarker(
        [centerCoordinate.latitude, centerCoordinate.longitude],
        { draggable: true }
      );

      // Update koordinat saat marker di-drag
      this.#marker.on('dragend', (event) => {
        const { lat, lng } = event.target.getLatLng();
        this.#updateLatLngInput(lat, lng);
      });

      // Update koordinat dan marker saat peta diklik
      this.#map.addMapEventListener('click', (event) => {
        const { lat, lng } = event.latlng;
        
        // Pindahkan marker ke posisi yang diklik
        this.#marker.setLatLng([lat, lng]);
        
        // Update input koordinat
        this.#updateLatLngInput(lat, lng);
      });

      // Set koordinat awal ke input
      this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  #updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;

    const latInput = this.#form.querySelector('input[name="latitude"]');
    const lngInput = this.#form.querySelector('input[name="longitude"]');
    
    if (latInput && lngInput) {
      latInput.value = latitude.toFixed(6);
      lngInput.value = longitude.toFixed(6);
    }
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

    toggleCameraButton.addEventListener('click', async () => {
      if (!this.#isCameraOpen) {
        try {
          await this.#camera.launch();
          this.#isCameraOpen = true;
          toggleCameraButton.innerHTML = '<i class="fas fa-camera"></i> Tutup Kamera';
          videoElement.style.display = 'block';
          capturePhotoButton.disabled = false;
        } catch (error) {
          console.error('Error starting camera:', error);
          this.showError('Gagal membuka kamera');
        }
      } else {
        this.#camera.stop();
        this.#isCameraOpen = false;
        toggleCameraButton.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
        videoElement.style.display = 'none';
        capturePhotoButton.disabled = true;
      }
    });

    capturePhotoButton.addEventListener('click', async () => {
      try {
        const photoBlob = await this.#camera.takePicture();
        if (photoBlob) {
          await this.#addTakenPicture(photoBlob);
          await this.#populateTakenPictures();
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        this.showError('Gagal mengambil foto');
      }
    });

    // Bind method untuk event listener
    this.#handleFileInput = this.#handleFileInput.bind(this);
    fileInput.addEventListener('change', this.#handleFileInput);
  }

  #handleFileInput = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Mohon pilih file gambar yang valid');
      return;
    }

    try {
      await this.#addTakenPicture(file);
      await this.#populateTakenPictures();
      // Reset file input agar bisa memilih file yang sama berulang kali
      event.target.value = '';
    } catch (error) {
      console.error('Error adding file:', error);
      this.showError('Gagal menambahkan foto');
    }
  }

  async #addTakenPicture(image) {
    const newPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: image,
    };
    this.#takenPhotos = [...this.#takenPhotos, newPhoto];
  }

  async #populateTakenPictures() {
    const previewList = document.getElementById('photo-preview-list');
    
    const html = this.#takenPhotos.map((photo, index) => {
      // Simpan object URL di photo object untuk bisa di-revoke nanti
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

    // Tambahkan event listener untuk tombol hapus
    previewList.querySelectorAll('.photo-delete-button').forEach(button => {
      button.addEventListener('click', () => {
        const photoId = button.dataset.photoId;
        const photo = this.#takenPhotos.find(p => p.id === photoId);
        if (photo?.objectUrl) {
          URL.revokeObjectURL(photo.objectUrl);
        }
        this.#removePicture(photoId);
        this.#populateTakenPictures();
      });
    });
  }

  #removePicture(id) {
    const photo = this.#takenPhotos.find(p => p.id === id);
    if (photo?.objectUrl) {
      URL.revokeObjectURL(photo.objectUrl);
    }
    this.#takenPhotos = this.#takenPhotos.filter(picture => picture.id !== id);
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
    this.#takenPhotos = [];
    this.#populateTakenPictures();
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
    // Bersihkan resource kamera
    if (this.#camera) {
      this.#camera.stop();
      this.#camera = null;
    }

    // Hentikan semua stream yang masih aktif
    Camera.stopAllStreams();

    // Reset state
    this.#isCameraOpen = false;
    this.#takenPhotos = [];

    // Hapus event listeners
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.removeEventListener('change', this.#handleFileInput);
    }

    // Bersihkan preview foto
    const previewList = document.getElementById('photo-preview-list');
    if (previewList) {
      // Revoke semua object URL untuk mencegah memory leak
      this.#takenPhotos.forEach(photo => {
        if (photo.objectUrl) {
          URL.revokeObjectURL(photo.objectUrl);
        }
      });
      previewList.innerHTML = '';
    }

    // Reset form jika ada
    if (this.#form) {
      this.#form.reset();
    }
  }
} 