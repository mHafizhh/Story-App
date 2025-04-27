import LoginPresenter from "./login-presenter";
import * as StoryAPI from "../../data/api";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container auth-container">
        <h1 class="auth-title">Login</h1>
        
        <div id="errorContainer" class="error-container"></div>
        
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
            <small class="email-warning">Format email tidak valid</small>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" minlength="8" required>
            <small class="password-warning">Password minimal 8 karakter</small>
          </div>
          
          <button type="submit" class="btn-submit">Login</button>
          
          <p class="auth-link">
            Belum punya akun? <a href="#/register">Register</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#initializeForm();
  }

  #initializeForm() {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    emailInput.addEventListener("input", (event) => {
      this.#presenter.validateEmail(event.target.value);
    });

    passwordInput.addEventListener("input", (event) => {
      this.#presenter.validatePassword(event.target.value);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.#presenter.login();
    });
  }

  showEmailValidation(isValid) {
    const emailInput = document.getElementById("email");
    const emailWarning = document.querySelector(".email-warning");

    emailWarning.style.display = isValid ? "none" : "block";
    emailInput.classList.toggle("invalid", !isValid);
    emailInput.classList.toggle("valid", isValid);
  }

  showPasswordValidation(isValid) {
    const passwordInput = document.getElementById("password");
    const passwordWarning = document.querySelector(".password-warning");

    passwordWarning.style.display = isValid ? "none" : "block";
    passwordInput.classList.toggle("invalid", !isValid);
    passwordInput.classList.toggle("valid", isValid);
  }

  getFormData() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    return { email, password };
  }

  showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = `<p>${message}</p>`;
  }

  clearError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = "";
  }

  showLoading() {
    const submitButton = document.querySelector(".btn-submit");
    submitButton.classList.add("loading");
    submitButton.disabled = true;
  }

  hideLoading() {
    const submitButton = document.querySelector(".btn-submit");
    submitButton.classList.remove("loading");
    submitButton.disabled = false;
  }
}
