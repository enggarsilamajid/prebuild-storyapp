import CONFIG from '../config';

const API = {
  async getStories() {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${CONFIG.BASE_URL}/stories?location=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.json();
  },

  async addStory(formData) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  },

  async login(data) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async register(data) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return response.json();
  },
};

export default API;