import showToast from "../../utils/toast";

export default class RegisterPresenter {
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

  async register() {
    const { name, email, password } = this.#view.getFormData();

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

      const response = await this.#model.register(name, email, password);

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      showToast("Registrasi berhasil! Silahkan login.");
      window.location.hash = "#/login";
    } catch (error) {
      this.#view.showError("Terjadi kesalahan saat mendaftar");
      console.error(error);
    } finally {
      this.#view.hideLoading();
    }
  }
} 