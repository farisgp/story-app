import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import CONFIG from "../../config";

class HomePage {
  // constructor() {
  //   this.presenter = new HomePresenter(this);
  //   this._map = null;
  // }
  #presenter = null;
  #map = null;

  async render() {
    return '<div id="home-container"></div>';
  }

  async afterRender() {
    const container = document.querySelector("#home-container");
    container.innerHTML = this.#getTemplate();

    this.#presenter = new HomePresenter({
      showLoading: this.showLoading.bind(this),
      hideLoading: this.hideLoading.bind(this),
      showError: this.showError.bind(this),
      renderStories: this.renderStories.bind(this),
      initMapAndMarkers: this.initMapAndMarkers.bind(this),
    });

    await this.#presenter.loadStories();
  }

  async beforeRender() {
    this.destroyMap();
  }

  #getTemplate() {
    return `
      <section class="container">
        <h1>Dicoding Story</h1>
        <div id="map-container" class="map-container"></div>
        <div id="stories-container" class="stories-grid"></div>
        <div id="loading-indicator" class="loading-indicator">Loading stories...</div>
        <div id="error-message" class="error-message" style="display: none;"></div>
      </section>
    `;
  }

  get storiesContainer() {
    return document.querySelector("#stories-container");
  }

  get loadingIndicator() {
    return document.querySelector("#loading-indicator");
  }

  get errorMessage() {
    return document.querySelector("#error-message");
  }

  get mapContainer() {
    return document.querySelector("#map-container");
  }

  showLoading() {
    this.loadingIndicator.style.display = "block";
    this.storiesContainer.innerHTML = "";
    this.errorMessage.style.display = "none";
  }

  hideLoading() {
    this.loadingIndicator.style.display = "none";
  }

  showError(message) {
    this.errorMessage.textContent = `Error: ${message}`;
    this.errorMessage.style.display = "block";
  }

  renderStories(stories) {
    this.storiesContainer.innerHTML = "";
    if (stories.length === 0) {
      this.storiesContainer.innerHTML = "<p>Belum ada story.</p>";
      return;
    }

    stories.forEach((story) => {
      const storyElement = `
          <div class="story-item">
            <img src="${story.photoUrl}" alt="${story.name}'s story photo" class="story-photo">
            <div class="story-content">
              <h2 class="story-name">${story.name}</h2>
              <p class="story-date">${showFormattedDate(story.createdAt)}</p>
              <p class="story-description">${story.description}</p>
              ${
                story.lat && story.lon
                  ? `<p class="story-location">Lokasi: ${story.lat}, ${story.lon}</p>`
                  : ""
              }
            </div>
          </div>
      `;
      this.storiesContainer.innerHTML += storyElement;
      // this.presenter._bindFavoriteButtons(stories);
    });
  }

  initMapAndMarkers(stories, apiKey = CONFIG.MAP_SERVICE_API_KEY) {
    if (!this.mapContainer) return;

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

    if (this.#map) {
      this.#map.remove();
    }

    this.#map = L.map(this.mapContainer).setView([0, 0], 2);

    const tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${apiKey}`;
    L.tileLayer(tileUrl, {
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    }).addTo(this.#map);

    const markers = [];
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.#map)
          .bindPopup(`
            <b>${story.name}</b><br>
            ${story.description}<br>
            <img src="${story.photoUrl}" alt="Story photo" style="max-width:100px; height:auto;">
          `);
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      this.#map.fitBounds(group.getBounds());
    }
  }

  destroyMap() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
  }
}

export default HomePage;
