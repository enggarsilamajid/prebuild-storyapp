import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content;
  #drawerButton;
  #navigationDrawer;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen);
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', false);
      }
    });
  }

  _updateNav() {
    const token = localStorage.getItem('token');
    const navList = document.querySelector('#nav-list');
    if (!navList) return;

    let html = `
      <li><button id="install-btn" style="display:none">Install App</button></li>
      <li><a href="#/" class="nav-link">Beranda</a></li>
      <li><a href="#/about" class="nav-link">About</a></li>
    `;

    if (token) {
      html += `
        <li><a href="#/favorite" class="nav-link">Favorite</a></li>
        <li><a href="#/add" class="nav-link">Tambah Data</a></li>
        <li><a href="#" id="logout-btn" class="nav-link">Logout</a></li>
        <li><button id="btn-subscribe">Memuat...</button></li>
      `;
    } else {
      html += `
        <li><a href="#/login" class="nav-link">Login</a></li>
        <li><a href="#/register" class="nav-link">Register</a></li>
      `;
    }

    navList.innerHTML = html;

    document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    this.#navigationDrawer.classList.remove('open');
    this.#drawerButton.setAttribute('aria-expanded', false);
  });
});

    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        location.hash = '/login';
      };
    }
  }

  async _setupPushButton() {
    const btn = document.querySelector('#btn-subscribe');
    if (!btn) return;

    const updateUI = async () => {
      const sub = await window.getPushSubscription();
      btn.innerText = sub
        ? 'Nonaktifkan Notifikasi'
        : 'Aktifkan Notifikasi';
    };

    btn.disabled = true;
    btn.innerText = 'Memuat...';

    await updateUI();
    btn.disabled = false;

    btn.onclick = async () => {
      btn.disabled = true;
      btn.innerText = 'Memproses...';

      try {
        const current = await window.getPushSubscription();

        if (current) {
          await window.unsubscribePush();
        } else {
          await window.subscribePush();
        }

        await updateUI();
      } catch (err) {
        console.error(err);
        btn.innerText = 'Gagal';
      }

      btn.disabled = false;
    };
  }

  async renderPage() {
  const url = getActiveRoute();
  let page = routes[url] || routes['/'];

  try {
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
      }).finished;
    } else {
      this.#content.innerHTML = await page.render();
    }

    this._updateNav();

    if (page.afterRender) {
      await page.afterRender();
    }

    await this._setupPushButton();

  } catch (err) {
    console.error('Render error:', err);
    this.#content.innerHTML = `<p style="padding:20px">Terjadi kesalahan</p>`;
  }
}
}

export default App;