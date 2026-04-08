import { apiFetch } from './api';
import { BoardsResponse, BoardDetails } from './types';

async function getErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getBoards(): Promise<BoardsResponse> {
  const res = await apiFetch('/boards');

  if (!res || !res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao buscar boards'));
  }

  return res.json();
}

export async function getBoardById(id: string): Promise<BoardDetails> {
  const res = await apiFetch(`/boards/${id}`);

  if (!res || !res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao buscar board'));
  }

  return res.json();
}

export async function getBoardActivity(boardId: string) {
  const res = await apiFetch(`/boards/${boardId}/activity?limit=50`);

  if (!res || !res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao buscar atividade'));
  }

  return res.json();
}

export async function createBoard(name: string, description?: string) {
  const res = await apiFetch('/boards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  if (!res || !res.ok) {
    throw new Error(await getErrorMessage(res, 'Erro ao criar board'));
  }

  return res.json();
}

export async function createColumn(
  boardId: string,
  name: string,
  position: number,
  color = '#6B7280',
  wip_limit: number | null = null
) {
  const res = await apiFetch(`/boards/${boardId}/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      position,
      color,
      wip_limit,
    }),
  });

  if (!res) {
    throw new Error('Sem resposta da API ao criar coluna');
  }

  if (!res.ok) {
    const text = await res.text();
    console.error('CREATE COLUMN STATUS:', res.status);
    console.error('CREATE COLUMN BODY:', text);
    throw new Error(text || `Erro ao criar coluna (status ${res.status})`);
  }

  return res.json();
}