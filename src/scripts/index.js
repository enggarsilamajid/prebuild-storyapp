import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import API from './data/api';
import { getAllStories, deleteStory } from './data/database';

let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  setupInstallButton();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      await navigator.serviceWorker.ready;
    } catch (err) {
      console.error('SW register error:', err);
    }
  });
}

function setupInstallButton() {
  const btn = document.querySelector('#install-btn');
  if (!btn) return;

  btn.style.display = 'inline-block';
  btn.disabled = true;
  btn.innerText = 'Install (menunggu tersedia)';

  btn.onclick = async () => {
    if (!deferredPrompt) return;

    btn.innerText = 'Memproses...';
    btn.disabled = true;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      btn.innerText = 'Berhasil diinstall';
      btn.style.display = 'none';
    } else {
      btn.innerText = 'Install dibatalkan';
      btn.disabled = false;
    }

    deferredPrompt = null;
  };
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btn = document.querySelector('#install-btn');
  if (!btn) return;

  btn.disabled = false;
  btn.innerText = 'Install App';
});

window.addEventListener('appinstalled', () => {
  const btn = document.querySelector('#install-btn');
  if (!btn) return;

  btn.innerText = 'App sudah terinstall';
  btn.disabled = true;
});

function base64ToBlob(base64) {
  if (!base64 || !base64.includes(',')) return null;

  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

async function syncOfflineData() {
  let stories = [];

  try {
    const data = await getAllStories();
    stories = Array.isArray(data) ? data : [];
  } catch {
    stories = [];
  }

  for (const story of stories) {
    try {
      const formData = new FormData();

      const blob = base64ToBlob(story.photoUrl);
      if (!blob) continue;

      formData.append('description', story.description || '');
      formData.append('photo', blob);
      formData.append('lat', story.lat);
      formData.append('lon', story.lon);

      await API.addStory(formData);
      await deleteStory(story.id);

    } catch (err) {
      console.error('sync error:', err);
    }
  }
}

window.addEventListener('online', () => {
  syncOfflineData();
});

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

window.getPushSubscription = async function () {
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
};

window.subscribePush = async function () {
  try {
    const reg = await navigator.serviceWorker.ready;

    if (Notification.permission === 'denied') return null;

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
    }

    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(subscription),
    });

    return subscription;

  } catch (err) {
    console.error('subscribe error:', err);
    return null;
  }
};

window.unsubscribePush = async function () {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (!sub) return;

    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(sub),
    });

    await sub.unsubscribe();

  } catch (err) {
    console.error('unsubscribe error:', err);
  }
};