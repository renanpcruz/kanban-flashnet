const API_BASE = 'https://renan.flashnetbrasil.com.br/api/v1';

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error('Login inválido');

  return res.json();
}

export async function logout() {
  const token = localStorage.getItem('access_token');

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {}

  localStorage.clear();
}