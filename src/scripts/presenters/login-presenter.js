import API from '../data/api';

export default class LoginPresenter {
  constructor({ view }) {
    this._view = view;
  }

  init() {
    document.querySelector('#login-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value.trim();
        const password = document.querySelector('#password').value.trim();

        try {
          const result = await API.login({ email, password });

          if (result.error) {
            this._view.showError('Email atau password salah');
            return;
          }

          const token = result.loginResult?.token;

          if (!token) {
            this._view.showError('Token tidak ditemukan');
            return;
          }

          localStorage.setItem('token', token);

          this._view.showSuccess('Login berhasil');

          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);

        } catch (err) {
          this._view.showError(err.message);
        }
      });
  }
}