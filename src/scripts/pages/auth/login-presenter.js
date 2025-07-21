import { getLogin } from "../../data/api";

class LoginPresenter {
  #view = null;
  #onLoginSuccess = null;
  #onLoginError = null;

  constructor({ view, onLoginSuccess, onLoginError }) {
    this.#view = view;
    this.#onLoginSuccess = onLoginSuccess;
    this.#onLoginError = onLoginError;

    this.#view.bindLoginEvent(this._login.bind(this));
  }

  async _login(data) {
    this.#view.showLoading();
    try {
      const response = await getLogin(data);
      if (response.error) {
        this.#view.showLoginError(response.message);
        if (this.#onLoginError) {
          this.#onLoginError(response.message);
        }
      } else {
        this.#view.showLoginSuccess();
        if (this.#onLoginSuccess) {
          this.#onLoginSuccess();
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      this.#view.showLoginError("Terjadi kesalahan saat login.");
      if (this.#onLoginError) {
        this.#onLoginError("Terjadi kesalahan saat login.");
      }
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default LoginPresenter;
