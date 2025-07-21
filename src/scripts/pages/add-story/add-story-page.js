import AddStoryPresenter from "./add-story-presenter";
import CONFIG from "../../config";
import Swal from "sweetalert2";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { getToken } from "../auth/auth";

// Leaflet marker config
L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

class AddStoryPage {
  #presenter;
  #map = null;
  #marker = null;
  #currentStream = null;
  #capturedImageBlob = null;

  async render() {
    return `
      <section class="container add-story-section">
        <h1>Tambah Story Baru</h1>
        <form id="addStoryForm" class="add-story-form">
          <div class="form-group photo-upload-group">
            <label>Gambar Story</label>
            <div class="camera-controls">
              <button type="button" id="openCameraButton" class="btn btn-primary">
                Buka Kamera 📷
              </button>
              <button type="button" class="btn btn-primary">
                <input type="file" id="photoFileInput" for="photoFileInput" accept="image/*" class="hidden-file-input">
                Pilih dari Galeri
              </button>
            </div>

            <div class="preview-area">
              <img id="imagePreview" alt="Pratinjau Gambar" class="image-preview" style="display:none;">
              <video id="videoPreview" autoplay class="video-preview" style="display:none;"></video>
              <p id="imagePlaceholder">Tidak ada gambar yang dipilih</p>
            </div>

            <button type="button" id="takePictureButton" class="btn btn-success" style="display:none;">
              Ambil Foto
            </button>
          </div>
          <div class="form-group">
            <label for="description">Deskripsi Story</label>
            <textarea id="description" rows="5" required placeholder="Ceritakan story Anda di sini..."></textarea>
          </div>
          <div class="form-group location-map-group">
            <label>Pilih Lokasi di Peta (Opsional)</label>
            <div id="add-story-map" class="map-container"></div>
            <div class="coordinates-display">
              <p>Latitude: <span id="latValue"></span></p>
              <p>Longitude: <span id="lonValue"></span></p>
            </div>
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
          </div>
          <button type="submit" class="submit-button">Tambah Story</button>
        </form>
        <div id="loading-indicator" class="loading-indicator" style="display:none;">Mengunggah...</div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      onAddStorySuccess: () => {
        Swal.fire("Berhasil!", "Story berhasil ditambahkan!", "success").then(() => {
          window.location.hash = "#/";
        });
      },
      onAddStoryError: (msg) => {
        Swal.fire("Gagal", msg, "error");
      },
    });

    this.#initElements();
    this.#initEvents();
    this.#initMap();
  }

  async beforeRender() {
    this.cleanup();
  }

  #initElements() {
    this.form = document.querySelector("#addStoryForm");
    this.descriptionInput = document.querySelector("#description");
    this.photoFileInput = document.querySelector("#photoFileInput");
    this.imagePreview = document.querySelector("#imagePreview");
    this.imagePlaceholder = document.querySelector("#imagePlaceholder");
    this.videoPreview = document.querySelector("#videoPreview");
    this.takePictureButton = document.querySelector("#takePictureButton");
    this.openCameraButton = document.querySelector("#openCameraButton");
    this.latInput = document.querySelector("#lat");
    this.lonInput = document.querySelector("#lon");
    this.latValueDisplay = document.querySelector("#latValue");
    this.lonValueDisplay = document.querySelector("#lonValue");
    this.loadingIndicator = document.querySelector("#loading-indicator");
  }

  #initEvents() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const photo = this.#capturedImageBlob || this.photoFileInput.files[0];
      if (!photo) {
        return Swal.fire("Oops", "Pilih atau ambil gambar terlebih dahulu.", "warning");
      }

      const token = getToken();
      if (!token) {
        return Swal.fire("Error", "Anda belum login!", "error");
      }

      this.#presenter.handleAddStory({
        description: this.descriptionInput.value,
        photo,
        lat: this.latInput.value || null,
        lon: this.lonInput.value || null,
        token,
      });
    });

    this.photoFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) this.#displayImagePreview(file);
      else this.#displayImagePreview(null);
      this.#capturedImageBlob = file;
    });

    this.openCameraButton.addEventListener("click", () => this.#startCamera());
    this.takePictureButton.addEventListener("click", () => this.#capturePicture());
  }

  #initMap() {
    const map = L.map("add-story-map").setView([0, 0], 2);
    const tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${CONFIG.MAP_SERVICE_API_KEY}`;

    L.tileLayer(tileUrl, {
      attribution:
        '<a href="https://www.maptiler.com/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (e) => {
      this.updateCoordinatesDisplay(e.latlng.lat, e.latlng.lng);
      this.setMapMarker(e.latlng, `Lokasi: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    });

    map.on("locationfound", (e) => {
      this.updateCoordinatesDisplay(e.latlng.lat, e.latlng.lng);
      this.setMapMarker(e.latlng, "Lokasi Anda saat ini");
    });

    map.on("locationerror", () => {
      console.warn("Tidak bisa mendapatkan lokasi.");
    });

    map.locate({ setView: true, maxZoom: 16 });
    this.setMapInstance(map);
  }

  showLoading() {
    this.loadingIndicator.style.display = "block";
    this.form.querySelector('button[type="submit"]').disabled = true;
  }

  hideLoading() {
    this.loadingIndicator.style.display = "none";
    this.form.querySelector('button[type="submit"]').disabled = false;
  }

  updateCoordinatesDisplay(lat, lon) {
    this.latValueDisplay.textContent = lat.toFixed(5);
    this.lonValueDisplay.textContent = lon.toFixed(5);
    this.latInput.value = lat;
    this.lonInput.value = lon;
  }

  setMapInstance(map) {
    this.#map = map;
  }

  setMapMarker(latlng, popupText) {
    if (this.#marker) this.#map.removeLayer(this.#marker);
    this.#marker = L.marker([latlng.lat, latlng.lng])
      .addTo(this.#map)
      .bindPopup(popupText)
      .openPopup();
  }

  #displayImagePreview(file) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.src = e.target.result;
        this.imagePreview.style.display = "block";
        this.videoPreview.style.display = "none";
        this.imagePlaceholder.style.display = "none";
        this.takePictureButton.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreview.src = "";
      this.imagePreview.style.display = "none";
      this.imagePlaceholder.style.display = "block";
    }
  }

  async #startCamera() {
    try {
      this.videoPreview.style.display = "block";
      this.imagePreview.style.display = "none";
      this.imagePlaceholder.style.display = "none";
      this.takePictureButton.style.display = "block";

      this.#currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoPreview.srcObject = this.#currentStream;
    } catch (error) {
      Swal.fire("Gagal membuka kamera", error.message, "error");
    }
  }

  #stopCamera() {
    if (this.#currentStream) {
      this.#currentStream.getTracks().forEach((track) => track.stop());
      this.videoPreview.srcObject = null;
      this.videoPreview.style.display = "none";
    }
  }

  #capturePicture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.videoPreview.videoWidth;
    canvas.height = this.videoPreview.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoPreview, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      this.#capturedImageBlob = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" });
      this.#displayImagePreview(this.#capturedImageBlob);
      this.#stopCamera();
    });
  }

  cleanup() {
    this.#stopCamera();
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
      this.#marker = null;
    }
    this.form?.reset();
    this.imagePreview.src = "";
    this.imagePreview.style.display = "none";
    this.imagePlaceholder.style.display = "block";
    this.#capturedImageBlob = null;
  }
}

export default AddStoryPage;
