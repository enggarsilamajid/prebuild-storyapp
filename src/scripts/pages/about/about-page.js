export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>About StoryApp</h1>
        <h2>Aplikasi berbagi cerita dengan peta interaktif</h2>
      </section>
    `;
  }

  async afterRender() {
    }
}
