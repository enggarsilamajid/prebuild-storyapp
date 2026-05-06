import HomePresenter from '../../presenters/home-presenter';

export default class HomePage {
  async render() {
    return `
      <section class="home-page">
        <h1>Home</h1>

        <h2>Peta Lokasi</h2>
        <div class="map-wrapper">
          <div id="map"></div>
        </div>

        <h2>Daftar Cerita</h2>
        <div id="stories"></div>
      </section>
    `;
  }

  async afterRender() {
    const presenter = new HomePresenter({ view: this });
    await presenter.init();
  }

  renderStories(stories) {
    const container = document.querySelector('#stories');

    if (!stories || stories.length === 0) {
      container.innerHTML = `<p>Tidak ada data</p>`;
      return;
    }

    container.innerHTML = `
      <div class="story-list">
        ${stories.map((story) => {
          const name = story.name || 'Tanpa Nama';
          const description = story.description || '-';
          const date = story.createdAt
            ? new Date(story.createdAt).toLocaleDateString('id-ID')
            : '-';
          const photo = story.photoUrl || '';

          return `
            <article class="story-card">
              ${photo ? `<img src="${photo}" alt="Foto cerita dari ${name}" />` : ''}

              ${story.isOffline ? `
                <span style="
                  background:red;
                  color:white;
                  padding:4px 8px;
                  font-size:12px;
                  border-radius:4px;
                  display:inline-block;
                  margin-top:8px;
                ">OFFLINE</span>
              ` : ''}

              <div class="story-content">
                <h3>${name}</h3>
                <p>${date}</p>
                <p>${description}</p>
                <button class="save-btn" data-id="${story.id}">Save</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  renderError(message) {
    document.querySelector('#stories').innerHTML = `
      <p style="text-align:center; margin-top:20px;">${message}</p>
    `;
  }
}