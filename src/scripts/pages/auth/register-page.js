import RegisterPresenter from '../../presenters/register-presenter';

export default class RegisterPage {
  async render() {
    return `
      <section class="auth-form">
        <h1>Register</h1>

        <!-- <h2>Form Register</h2> -->

        <form id="register-form">
          <label for="name">Nama</label>
          <input type="text" id="name" required />

          <label for="email">Email</label>
          <input type="email" id="email" required />

          <label for="password">Password</label>
          <div class="password-wrapper">
            <input type="password" id="password" required />
            <button type="button" id="toggle-password">👁</button>
          </div>

          <button type="submit">Register</button>
        </form>

        <p id="status"></p>

        <p>Sudah punya akun? <a href="#/login">Login</a></p>
      </section>
    `;
  }

  async afterRender() {
    const presenter = new RegisterPresenter({ view: this });
    presenter.init();

    const password = document.querySelector('#password');
    const toggle = document.querySelector('#toggle-password');

    toggle.addEventListener('click', () => {
      password.type = password.type === 'password' ? 'text' : 'password';
    });
  }

  showSuccess(msg) {
    document.querySelector('#status').innerHTML = `<p style="color:green;">${msg}</p>`;
  }

  showError(msg) {
    document.querySelector('#status').innerHTML = `<p style="color:red;">${msg}</p>`;
  }
}