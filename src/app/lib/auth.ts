const API_BASE = 'https://renan.flashnetbrasil.com.br/api/v1';

export type MeResponse = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  is_active: boolean;
  created_at: string;
};

async function getErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao fazer login'));
  }

  return res.json();
}

export async function getMe(): Promise<MeResponse> {
  const token = localStorage.getItem('access_token');

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao buscar usuário'));
  }

  return res.json();
}