const API_BASE = 'https://renan.flashnetbrasil.com.br/api/v1';

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) throw new Error('Refresh inválido');

  const data = await res.json();

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data.access_token;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('access_token');

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    try {
      token = await refreshToken();

      const retry = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      return retry;
    } catch {
      localStorage.clear();
      window.location.href = '/login';
      return;
    }
  }

  return res;
}