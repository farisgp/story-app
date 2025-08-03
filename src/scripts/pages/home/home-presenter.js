import { getAllStories } from "../../data/api";
import CONFIG from "../../config";
import { getToken } from "../auth/auth";
import { saveStoryToFavorites } from "../../data/database.js";

class HomePresenter {
  #view = null;

  constructor(view) {
    this.#view = view;
  }

  async _bindFavoriteButtons(stories) {
    const buttons = document.querySelectorAll(".favorite");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.id;
        const story = stories.find((s) => s.id === storyId);

        try {
          await saveStoryToFavorites(story);
          alert("📌 Cerita berhasil ditambahkan ke favorit!");
        } catch (error) {
          console.error("Failed to save favorite:", error);
          alert("❌ Gagal menyimpan cerita ke favorit.");
        }
      });
    });
  }

  async loadStories() {
    this.#view.showLoading();
    try {
      const token = getToken();
      if (!token) {
        this.#view.showError("Anda harus login untuk melihat story.");
        return;
      }

      const response = await getAllStories({ token, location: 1 });

      if (response.error) {
        this.#view.showError(response.message);
      } else {
        this.#view.renderStories(response.listStory);
        this.#view.initMapAndMarkers(response.listStory, CONFIG.MAP_SERVICE_API_KEY);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      this.#view.showError("Gagal memuat story. Periksa koneksi internet Anda.");
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default HomePresenter;
