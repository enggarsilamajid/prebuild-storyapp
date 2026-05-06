import API from '../data/api';
import L from 'leaflet';
import { getAllStories, saveStory } from '../data/database';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default class HomePresenter {
  constructor({ view }) {
    this._view = view;
    this._map = null;
  }

  async init() {
    const token = localStorage.getItem('token');
    this._initMap();

    if (!token) {
      this._view.renderError('Silahkan login untuk melihat dan berbagi cerita');
      return;
    }

    let offlineStories = [];
    try {
      const data = await getAllStories();
      offlineStories = Array.isArray(data) ? data : [];
    } catch {
      offlineStories = [];
    }

    if (!navigator.onLine) {
      if (!offlineStories.length) {
        this._view.renderError('Tidak ada data offline');
        return;
      }

      const mappedOffline = offlineStories.map(s => ({ ...s, isOffline: true }));
      this._view.renderStories(mappedOffline);
      this._addMarkers(mappedOffline);
      this._setupSaveButton(mappedOffline);
      return;
    }

    try {
      const response = await API.getStories();
      const stories = Array.isArray(response.listStory) ? response.listStory : [];

      const merged = [
        ...offlineStories.map(s => ({ ...s, isOffline: true })),
        ...stories
      ];

      if (!merged.length) {
        this._view.renderError('Tidak ada data');
        return;
      }

      this._view.renderStories(merged);
      this._addMarkers(merged);
      this._setupSaveButton(merged);

      setTimeout(() => {
        if (this._map) this._map.invalidateSize();
      }, 300);

    } catch (error) {
      this._view.renderError(error.message);
    }
  }

  _initMap() {
    this._map = L.map('map').setView([-2.5, 118], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this._map);
  }

  _addMarkers(stories) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(`
            <b>${story.name || 'Tanpa Nama'}</b><br/>
            <small>${story.createdAt ? new Date(story.createdAt).toLocaleDateString('id-ID') : '-'}</small><br/>
            ${story.description || '-'}
            ${story.isOffline ? '<br/><i>(Offline)</i>' : ''}
          `);
      }
    });
  }

  _setupSaveButton(stories) {
    document.querySelectorAll('.save-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const story = stories.find((s) => s.id == id);
        if (!story) return;
        await saveStory(story);
        alert('Berhasil disimpan');
      });
    });
  }
}