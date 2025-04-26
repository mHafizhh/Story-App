import { login } from "../../data/api";
import AuthService from "../../data/auth-service";
import showToast from "../../utils/toast";

export default class LoginPage {
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

  #validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async afterRender() {
    const loginForm = document.getElementById("loginForm");
    const errorContainer = document.getElementById("errorContainer");
    const emailInput = document.getElementById("email");
    const emailWarning = document.querySelector(".email-warning");
    const passwordInput = document.getElementById("password");
    const passwordWarning = document.querySelector(".password-warning");
    const submitButton = loginForm.querySelector(".btn-submit");

    // Email validation
    emailInput.addEventListener("input", (event) => {
      const email = event.target.value;
      if (this.#validateEmail(email)) {
        emailWarning.style.display = "none";
        emailInput.classList.remove("invalid");
        emailInput.classList.add("valid");
      } else {
        emailWarning.style.display = "block";
        emailInput.classList.remove("valid");
        emailInput.classList.add("invalid");
      }
    });

    // Password validation
    passwordInput.addEventListener("input", (event) => {
      const password = event.target.value;
      if (password.length >= 8) {
        passwordWarning.style.display = "none";
        passwordInput.classList.remove("invalid");
        passwordInput.classList.add("valid");
      } else {
        passwordWarning.style.display = "block";
        passwordInput.classList.remove("valid");
        passwordInput.classList.add("invalid");
      }
    });

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value;
      const password = passwordInput.value;

      // Validasi sebelum submit
      if (!this.#validateEmail(email)) {
        errorContainer.innerHTML = "<p>Format email tidak valid</p>";
        return;
      }

      if (password.length < 8) {
        errorContainer.innerHTML = "<p>Password minimal 8 karakter</p>";
        return;
      }

      try {
        // Aktifkan loading state
        submitButton.classList.add("loading");
        submitButton.disabled = true;
        errorContainer.innerHTML = "";

        const response = await login(email, password);

        if (response.error) {
          errorContainer.innerHTML = `<p>${response.message}</p>`;
          return;
        }

        // Login sukses
        AuthService.setAuth(response.loginResult);
        showToast("Login berhasil!");
        window.location.hash = "#/";
      } catch (error) {
        errorContainer.innerHTML = "<p>Terjadi kesalahan saat login</p>";
        console.error(error);
      } finally {
        // Nonaktifkan loading state
        submitButton.classList.remove("loading");
        submitButton.disabled = false;
      }
    });
  }
}
