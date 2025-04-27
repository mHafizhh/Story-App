import AuthService from "../../data/auth-service";
import showToast from "../../utils/toast";

export default class LoginPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    this.#view.showEmailValidation(isValid);
    return isValid;
  }

  validatePassword(password) {
    const isValid = password.length >= 8;
    this.#view.showPasswordValidation(isValid);
    return isValid;
  }

  async login() {
    const { email, password } = this.#view.getFormData();

    if (!this.validateEmail(email)) {
      this.#view.showError("Format email tidak valid");
      return;
    }

    if (!this.validatePassword(password)) {
      this.#view.showError("Password minimal 8 karakter");
      return;
    }

    try {
      this.#view.showLoading();
      this.#view.clearError();

      const response = await this.#model.login(email, password);

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      AuthService.setAuth(response.loginResult);
      showToast("Login berhasil!");
      window.location.hash = "#/";
    } catch (error) {
      this.#view.showError("Terjadi kesalahan saat login");
      console.error(error);
    } finally {
      this.#view.hideLoading();
    }
  }
} 