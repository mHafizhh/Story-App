import showToast from "../../utils/toast";

export default class AddStoryPresenter {
  #view = null;
  #model = null;
  #state = {
    isCameraOpen: false,
    photos: [],
    map: null,
    marker: null
  };

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  // Getter untuk photos
  getPhotos() {
    return [...this.#state.photos]; // Return copy untuk mencegah mutasi langsung
  }

  // Form Handling
  async handleFormSubmit(formData) {
    if (!this.#validateForm(formData)) return;
    await this.submitStory(formData);
  }

  #validateForm(data) {
    if (!data.description) {
      this.#view.showError("Deskripsi tidak boleh kosong");
      return false;
    }
    if (!data.photo) {
      this.#view.showError("Harap ambil foto terlebih dahulu");
      return false;
    }

    // Validasi tipe file
    if (!data.photo.type.startsWith('image/')) {
      this.#view.showError("File harus berupa gambar");
      return false;
    }

    // Validasi ukuran file (1MB = 1024 * 1024 bytes)
    if (data.photo.size > 1024 * 1024) {
      this.#view.showError("Ukuran foto tidak boleh lebih dari 1MB");
      return false;
    }

    // Validasi koordinat
    if (data.lat) {
      if (isNaN(data.lat) || data.lat < -90 || data.lat > 90) {
        this.#view.showError("Latitude tidak valid");
        return false;
      }
    }

    if (data.lon) {
      if (isNaN(data.lon) || data.lon < -180 || data.lon > 180) {
        this.#view.showError("Longitude tidak valid");
        return false;
      }
    }

    return true;
  }

  // Map Handling
  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      const map = await this.#view.initialMap();
      this.#state.map = map;
      
      const centerCoordinate = map.getCenter();
      this.#initializeMapMarker(centerCoordinate);
      this.#setupMapEventListeners();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
      this.#view.showError('Gagal memuat peta');
    } finally {
      this.#view.hideMapLoading();
    }
  }

  #initializeMapMarker(coordinate) {
    if (!this.#state.map) return;

    this.#state.marker = this.#state.map.addMarker(
      [coordinate.latitude, coordinate.longitude],
      { draggable: true }
    );

    this.#view.updateLatLngInput(coordinate.latitude, coordinate.longitude);
  }

  #setupMapEventListeners() {
    if (!this.#state.marker || !this.#state.map) return;

    this.#state.marker.on('dragend', (event) => {
      const { lat, lng } = event.target.getLatLng();
      this.#view.updateLatLngInput(lat, lng);
    });

    this.#state.map.addMapEventListener('click', (event) => {
      const { lat, lng } = event.latlng;
      this.#state.marker.setLatLng([lat, lng]);
      this.#view.updateLatLngInput(lat, lng);
    });
  }

  // Camera Handling
  async handleCameraToggle() {
    if (!this.#state.isCameraOpen) {
      await this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  async startCamera() {
    try {
      await this.#view.launchCamera();
      this.#state.isCameraOpen = true;
      this.#view.updateCameraUI({
        isOpen: true,
        buttonText: '<i class="fas fa-camera"></i> Tutup Kamera',
        showVideo: true,
        enableCapture: true
      });
    } catch (error) {
      console.error('Error starting camera:', error);
      this.#view.showError('Gagal membuka kamera');
    }
  }

  stopCamera() {
    this.#view.stopCamera();
    this.#state.isCameraOpen = false;
    this.#view.updateCameraUI({
      isOpen: false,
      buttonText: '<i class="fas fa-camera"></i> Buka Kamera',
      showVideo: false,
      enableCapture: false
    });
  }

  async handleCapturePhoto() {
    try {
      const photoBlob = await this.#view.takePicture();
      if (photoBlob) {
        await this.addPhoto(photoBlob);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.#view.showError('Gagal mengambil foto');
    }
  }

  // Photo Handling
  async handleFileSelect(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.#view.showError('Mohon pilih file gambar yang valid');
      return;
    }

    try {
      await this.addPhoto(file);
    } catch (error) {
      console.error('Error adding file:', error);
      this.#view.showError('Gagal menambahkan foto');
    }
  }

  async addPhoto(image) {
    const newPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: image,
    };
    this.#state.photos = [...this.#state.photos, newPhoto];
    await this.#view.updatePhotoPreview(this.#state.photos);
  }

  removePhoto(id) {
    const photo = this.#state.photos.find(p => p.id === id);
    if (photo?.objectUrl) {
      URL.revokeObjectURL(photo.objectUrl);
    }
    this.#state.photos = this.#state.photos.filter(photo => photo.id !== id);
    this.#view.updatePhotoPreview(this.#state.photos);
  }

  // Story Submission
  async submitStory(data) {
    this.#view.showSubmitLoadingButton();
    try {
      // Format data sesuai API
      const storyData = {
        description: data.description,
        photo: data.photo,
        lat: data.lat || undefined,
        lon: data.lon || undefined
      };

      const result = await this.#model.addStory(storyData);

      if (result.error) {
        this.#view.storeFailed(result.message);
        return;
      }

      this.#view.storeSuccessfully("Cerita berhasil ditambahkan");
    } catch (error) {
      console.error('submitStory: error:', error);
      
      // Handle specific errors
      if (error.message.includes("Ukuran foto")) {
        this.#view.storeFailed(error.message);
      } else if (error.message.includes("token")) {
        this.#view.storeFailed("Sesi anda telah berakhir, silakan login kembali");
        // Redirect ke halaman login
        window.location.hash = "#/login";
      } else {
        this.#view.storeFailed("Terjadi kesalahan saat menambahkan cerita");
      }
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  // Cleanup
  destroy() {
    this.stopCamera();
    this.#state.photos.forEach(photo => {
      if (photo.objectUrl) {
        URL.revokeObjectURL(photo.objectUrl);
      }
    });
    this.#state = {
      isCameraOpen: false,
      photos: [],
      map: null,
      marker: null
    };
  }
} 