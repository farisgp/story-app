import { getRegistered } from "../../data/api";

class RegisterPresenter {
  #getFormData = null;
  #showLoading = null;
  #hideLoading = null;
  #showRegisterError = null;
  #showRegisterSuccess = null;
  #onRegisterSuccess = null;
  #onRegisterError = null;

  constructor({
    getFormData,
    showLoading,
    hideLoading,
    showRegisterError,
    showRegisterSuccess,
    onRegisterSuccess,
    onRegisterError,
  }) {
    this.#getFormData = getFormData;
    this.#showLoading = showLoading;
    this.#hideLoading = hideLoading;
    this.#showRegisterError = showRegisterError;
    this.#showRegisterSuccess = showRegisterSuccess;
    this.#onRegisterSuccess = onRegisterSuccess;
    this.#onRegisterError = onRegisterError;
  }

  async handleRegister() {
    this.#showLoading();

    try {
      const data = this.#getFormData();
      const response = await getRegistered(data);

      if (response.error) {
        this.#showRegisterError(response.message);
        this.#onRegisterError?.(response.message);
      } else {
        this.#showRegisterSuccess();
        this.#onRegisterSuccess?.();
      }
    } catch (err) {
      this.#showRegisterError("Terjadi kesalahan saat registrasi.");
      this.#onRegisterError?.("Terjadi kesalahan saat registrasi.");
    } finally {
      this.#hideLoading();
    }
  }
}

export default RegisterPresenter;
