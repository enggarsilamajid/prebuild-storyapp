import AddPresenter from '../../presenters/add-presenter';

export default class AddPage {
  async render() {
    return `
      <section class="container">
        <h1>Tambah Data</h1>

        <h2>Form Tambah Cerita</h2>

        <form id="story-form">
          <label for="description">Deskripsi</label>
          <input id="description" name="description" type="text" required />

          <label for="photo-file">Upload Gambar</label>
          <input type="file" id="photo-file" accept="image/*" name="photo" />

<button type="button" id="btn-start-camera">Buka Kamera</button>
<button type="button" id="btn-stop-camera" style="display:none;">Tutup Kamera</button>

<div id="camera-section" style="display:none;">
  <video id="camera-preview" autoplay playsinline style="width:100%; max-width:300px;"></video>

  <div>
    <button type="button" id="btn-capture">Ambil Gambar</button>
    <button type="button" id="btn-switch">Ganti Kamera</button>
  </div>
</div>

<div id="preview-section" style="display:none;">
  <img id="preview-image" style="width:100%; max-width:300px;" alt="Preview gambar"/>
  <br/>
  <button type="button" id="btn-retake">Ambil Ulang</button>
  <button type="button" id="btn-delete">Hapus Foto</button>
</div>

          <canvas id="snapshot" style="display:none;"></canvas>

          <p>Klik peta untuk memilih lokasi</p>
          <div id="map"></div>
          <p id="latlon"></p>

          <button type="submit">Kirim</button>

          <p id="status"></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new AddPresenter({ view: this });
    this._presenter.init();
  }

  updateLatLon(lat, lon) {
    document.querySelector('#latlon').innerText = `Lat: ${lat}, Lon: ${lon}`;
  }

  showCamera(stream) {
    const video = document.querySelector('#camera-preview');
    video.srcObject = stream;
    document.querySelector('#camera-section').style.display = 'block';
    document.querySelector('#preview-section').style.display = 'none';
  }

  showPreview(imageUrl) {
    const img = document.querySelector('#preview-image');
    img.src = imageUrl;
    document.querySelector('#camera-section').style.display = 'none';
    document.querySelector('#preview-section').style.display = 'block';
  }

  hideCamera() {
    document.querySelector('#camera-section').style.display = 'none';
  }

  showSuccess(message) {
    document.querySelector('#status').innerText = message;
  }

  showError(message) {
    document.querySelector('#status').innerText = message;
  }
}