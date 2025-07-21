import { addStory } from "../../data/api";

class AddStoryPresenter {
  #view;
  #onAddStorySuccess;
  #onAddStoryError;

  constructor({ view, onAddStorySuccess, onAddStoryError }) {
    this.#view = view;
    this.#onAddStorySuccess = onAddStorySuccess;
    this.#onAddStoryError = onAddStoryError;
  }

  async handleAddStory(data) {
    this.#view.showLoading();
    try {
      if (!data.token) throw new Error("Token tidak tersedia. Silakan login terlebih dahulu.");

      const response = await addStory(data);
      if (response.error) {
        this.#onAddStoryError?.(response.message);
      } else {
        this.#onAddStorySuccess?.();
      }
    } catch (err) {
      this.#onAddStoryError?.(err.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default AddStoryPresenter;
