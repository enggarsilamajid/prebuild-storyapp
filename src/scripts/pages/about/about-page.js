export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>About StoryApp</h1>
        <h4>Aplikasi berbagi cerita dengan peta interaktif</h4>
      </section>
    `;
  }

  async afterRender() {
    }
}
