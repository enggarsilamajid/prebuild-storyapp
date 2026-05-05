import API from '../data/api';
import L from 'leaflet';
import { saveStory } from '../data/database';

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export default class AddPresenter {
  constructor({ view }) {
    this._view = view;
    this._map = null;
    this._selectedMarker = null;
    this._selectedLat = null;
    this._selectedLon = null;
    this._stream = null;
    this._facingMode = 'environment';
    this._capturedBlob = null;
  }

  async init() {
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    this._initMap();
    this._initCamera();
    this._initForm();
  }

  _initMap() {
    this._map = L.map('map').setView([-6.2, 106.8], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this._map);

    this._map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      this._selectedLat = lat;
      this._selectedLon = lng;

      if (this._selectedMarker) {
        this._map.removeLayer(this._selectedMarker);
      }

      this._selectedMarker = L.marker([lat, lng]).addTo(this._map);
      this._view.updateLatLon(lat, lng);
    });
  }

  _initCamera() {
    const btnStart = document.querySelector('#btn-start-camera');
    const btnStop = document.querySelector('#btn-stop-camera');
    const fileInput = document.querySelector('#photo-file');

    btnStart.addEventListener('click', async () => {
      await this._startCamera();
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
      fileInput.disabled = true;
    });

    btnStop.addEventListener('click', () => {
      this._stopCamera();
      btnStart.style.display = 'block';
      btnStop.style.display = 'none';
      fileInput.disabled = false;
    });

    document.querySelector('#btn-switch')
      .addEventListener('click', async () => {
        this._facingMode =
          this._facingMode === 'environment' ? 'user' : 'environment';
        await this._startCamera();
      });

    document.querySelector('#btn-capture')
      .addEventListener('click', async () => {
        const blob = await this._takePhoto();
        this._capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        this._view.showPreview(imageUrl);
        this._stopCamera();
      });

    document.querySelector('#btn-retake')
      .addEventListener('click', async () => {
        this._capturedBlob = null;
        await this._startCamera();
      });

    fileInput.addEventListener('change', () => {
      btnStart.disabled = fileInput.files.length > 0;
    });

    document.querySelector('#btn-delete')
      .addEventListener('click', () => {
        this._capturedBlob = null;
        fileInput.value = '';
        btnStart.disabled = false;
        document.querySelector('#preview-section').style.display = 'none';
      });
  }

  async _startCamera() {
    if (this._stream) this._stopCamera();

    this._stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: this._facingMode },
    });

    this._view.showCamera(this._stream);
  }

  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }

    this._view.hideCamera();

    document.querySelector('#btn-start-camera').style.display = 'block';
    document.querySelector('#btn-stop-camera').style.display = 'none';
  }

  async _takePhoto() {
    const video = document.querySelector('#camera-preview');
    const canvas = document.querySelector('#snapshot');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
    });
  }

  _initForm() {
    document.querySelector('#story-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const description = document.querySelector('#description').value;
        const fileInput = document.querySelector('#photo-file');
        let photo = fileInput.files[0] || this._capturedBlob;

        if (!photo || !this._selectedLat || !this._selectedLon) {
          this._view.showError('Lengkapi data');
          return;
        }

        if (!navigator.onLine) {
          const base64 = await blobToBase64(photo);

          await saveStory({
            name: 'Anda',
            description,
            createdAt: new Date().toISOString(),
            photoUrl: base64,
            lat: this._selectedLat,
            lon: this._selectedLon,
            isOffline: true,
          });

          this._view.showSuccess('Disimpan offline');

          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);

          return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        formData.append('lat', this._selectedLat);
        formData.append('lon', this._selectedLon);

        const result = await API.addStory(formData);

        if (result.error) {
          this._view.showError(result.message);
          return;
        }

        this._view.showSuccess('Berhasil tambah data');

        setTimeout(() => {
          window.location.hash = '/';
        }, 1000);
      });
  }
}
