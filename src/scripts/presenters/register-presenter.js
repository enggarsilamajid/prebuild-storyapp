import API from '../data/api';

export default class RegisterPresenter {
  constructor({ view }) {
    this._view = view;
  }

  init() {
    const form = document.querySelector('#register-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await API.register({ name, email, password });

        if (response.error) {
          this._view.showError(response.message);
          return;
        }

        this._view.showSuccess('Register berhasil! Silakan login.');

        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);

      } catch (error) {
        this._view.showError(error.message);
      }
    });
  }
}