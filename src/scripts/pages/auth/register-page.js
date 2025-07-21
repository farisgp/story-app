import RegisterPresenter from "./register-presenter";
import Swal from "sweetalert2";

class RegisterPage {
  #form = null;
  #nameInput = null;
  #emailInput = null;
  #passwordInput = null;
  #loadingIndicator = null;
  #errorMessage = null;

  async render() {
    return '<div id="register-container"></div>';
  }

  async afterRender() {
    const container = document.querySelector("#register-container");
    container.innerHTML = this.#getTemplate();

    // assign element references
    this.#form = document.querySelector("#registerForm");
    this.#nameInput = document.querySelector("#name");
    this.#emailInput = document.querySelector("#email");
    this.#passwordInput = document.querySelector("#password");
    this.#loadingIndicator = document.querySelector("#loading-indicator");
    this.#errorMessage = document.querySelector("#error-message");

    // bind submit event
    const presenter = new RegisterPresenter({
      getFormData: () => ({
        name: this.#nameInput.value,
        email: this.#emailInput.value,
        password: this.#passwordInput.value,
      }),
      showLoading: this.showLoading.bind(this),
      hideLoading: this.hideLoading.bind(this),
      showRegisterError: this.showRegisterError.bind(this),
      showRegisterSuccess: this.showRegisterSuccess.bind(this),
      onRegisterSuccess: () => {
        Swal.fire("Berhasil!", "Registrasi berhasil! Silakan login.", "success");
        window.location.hash = "#/login";
      },
      onRegisterError: (message) => {
        console.error("Registration error:", message);
      },
    });

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      presenter.handleRegister();
    });
  }

  showLoading() {
    this.#loadingIndicator.style.display = "flex";
    this.#errorMessage.style.display = "none";
    this.#form.querySelector(".auth-button").disabled = true;
  }

  hideLoading() {
    this.#loadingIndicator.style.display = "none";
    this.#form.querySelector(".auth-button").disabled = false;
  }

  showRegisterError(message) {
    this.#errorMessage.textContent = `Registrasi Gagal: ${message}`;
    this.#errorMessage.style.display = "block";
  }

  showRegisterSuccess() {
    // Notifikasi utama ditangani oleh onRegisterSuccess()
    console.log("Registrasi sukses!");
  }

  #getTemplate() {
    return `
      <section class="auth-section">
        <div class="auth-card">
          <h1>Register</h1>
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" required placeholder="Masukkan nama Anda">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="Minimal 8 karakter">
            </div>
            <button type="submit" class="auth-button">Register</button>
          </form>
          <p class="auth-switch-link">Sudah punya akun? <a href="#/login">Login di sini</a></p>
          <div id="loading-indicator" class="loading-indicator auth-loading-indicator" style="display:none;">
            <div class="spinner"></div>
            <p>Registering...</p>
          </div>
          <div id="error-message" class="error-message auth-error-message" style="display:none;"></div>
        </div>
      </section>
    `;
  }
}

export default RegisterPage;
