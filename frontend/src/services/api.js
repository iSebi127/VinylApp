const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const songAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/api/songs`).then(r => r.json()),

  getById: (id) =>
    fetch(`${BASE_URL}/api/songs/${id}`).then(r => r.json()),

  search: (params) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/api/songs/search?${qs}`).then(r => r.json());
  },

  create: (formData) =>
    fetch(`${BASE_URL}/api/songs`, {
      method: 'POST',
      body: formData,
    }).then(async r => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }),

  update: (id, formData) =>
    fetch(`${BASE_URL}/api/songs/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(async r => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/api/songs/${id}`, { method: 'DELETE' }),
};
