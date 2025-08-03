
import FavoritePresenter from "./favorite-presenter";

class FavoritePage {
  #presenter = null;

  constructor() {
    this.presenter = new FavoritePresenter(this);
  }

  // async render() {
  //   return '<div id="home-container"></div>';
  // }
  async render() {
    try {
      return `
        <section class="container">
            <div class="filter-controls">
                <h1>Story Archive</h1>
                <select id="pageSizeSelect">
                <option value="8" ${
                  this.presenter.pageSize === 8 ? "selected" : ""
                }>8 per page</option>
                <option value="12" ${
                  this.presenter.pageSize === 12 ? "selected" : ""
                }>12 per page</option>
                <option value="16" ${
                  this.presenter.pageSize === 16 ? "selected" : ""
                }>16 per page</option>
                </select>
            </div>

          <div id="storiesContainer" class="stories-container"></div>

          <div id="loadingIndicator" class="loading-indicator">Loading...</div>
          <div id="errorMessage" class="error-message"></div>
        </section>
      `;
    } catch (error) {
      console.error("Render error:", error);
      return `
        <section class="container">
          <div class="error-message">
            <h2>Failed to load page</h2>
            <p>${error.message}</p>
            <button id="retryButton" class="btn-retry">Try Again</button>
          </div>
        </section>
      `;
    }
  }

  // async afterRender() {
  //   const container = document.querySelector("#home-container");
  //   container.innerHTML = this.#getTemplate();

  //   this.#presenter = new FavoritePresenter({
  //     showLoading: this.showLoading.bind(this),
  //     hideLoading: this.hideLoading.bind(this),
  //     showError: this.showError.bind(this),
  //     renderStories: this.renderStories.bind(this)
  //   });

  //   // await this.#presenter.loadStories();
  //   this.#presenter = new FavoritePresenter(this);
  //   await this.#presenter.initialize();
  // }
  async afterRender() {
    // try {
    //   await this.presenter.initialize();
    //   this.setupEventListeners();
    // } catch (error) {
    //   console.error("Initialization error:", error);
    //   this.showError(`Initialization failed: ${error.message}`);
    // }
    const container = document.querySelector("#home-container");
    container.innerHTML = this.#getTemplate();

    this.#presenter = new FavoritePresenter ({
      showLoading: this.showLoading.bind(this),
      hideLoading: this.hideLoading.bind(this),
      showError: this.showError.bind(this),
      renderStories: this.renderStories.bind(this),
      initMapAndMarkers: this.initMapAndMarkers.bind(this),
    });

    await this.#presenter.loadStories();
  }

  setupEventListeners() {
    document
      .getElementById("pageSizeSelect")
      .addEventListener("change", (e) => {
        this.presenter.setPageSize(parseInt(e.target.value));
      });

    const retryButton = document.getElementById("retryButton");
    if (retryButton) {
      retryButton.addEventListener("click", () => window.location.reload());
    }
  }

  #getTemplate() {
    return `
      <section class="container">
        <h1>Dicoding Story</h1>
        <div id="stories-container" class="stories-grid"></div>
        <div id="loading-indicator" class="loading-indicator">Loading favorite stories...</div>
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

  setupDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const storyId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this story?")) {
          await this.presenter.deleteStory(storyId);
        }
      });
    });
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
      this.storiesContainer.innerHTML = "<p>Belum ada favorit.</p>";
      return;
    }

    stories.forEach((story) => {
      const storyElement = `
        <div class="story-card" data-id="${story.id}">
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
            <button class="delete-btn" data-id="${story.id}">Delete</button>
          </div>
        </div>
      `;
      this.storiesContainer.innerHTML += storyElement;
    });
    this.setupDeleteButtonListeners();
  }

}

export default FavoritePage;
