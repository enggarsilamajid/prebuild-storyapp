import { getAllStories, deleteStory } from '../../data/database';

export default class FavoritePage {
  async render() {
    return `
      <section class="favorite-page">
        <h1>Favorite Stories</h1>
        <div id="favorite-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const container = document.querySelector('#favorite-list');

    let stories = [];
    try {
      const data = await getAllStories();
      stories = Array.isArray(data) ? data : [];
    } catch {
      stories = [];
    }

    if (!stories.length) {
      container.innerHTML = `<p>Tidak ada data favorite</p>`;
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

              <div class="story-content">
                <h3>${name}</h3>
                <p>${date}</p>
                <p>${description}</p>
                <button class="delete-btn" data-id="${story.id}">Hapus</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await deleteStory(id);
        location.reload();
      });
    });
  }
}