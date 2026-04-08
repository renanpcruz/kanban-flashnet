import { apiFetch } from './api';
import { BoardsResponse, Board } from './types';
import { BoardDetails } from './types';

export async function getBoards(): Promise<BoardsResponse> {
  const res = await apiFetch('/boards');

  if (!res || !res.ok) throw new Error('Erro ao buscar boards');

  return res.json();
}

export async function getBoardById(id: string): Promise<BoardDetails> {
  const res = await apiFetch(`/boards/${id}`);

  if (!res || !res.ok) throw new Error('Erro ao buscar board');

  return res.json();
}

export async function getBoardActivity(boardId: string) {
  const res = await apiFetch(`/boards/${boardId}/activity?limit=50`);

  if (!res || !res.ok) throw new Error('Erro ao buscar atividade');

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

  if (!res || !res.ok) throw new Error('Erro ao criar board');

  return res.json();
}

export async function createColumn(
  boardId: string,
  name: string
) {
  const res = await apiFetch(`/boards/${boardId}/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      position: 0,
      color: '#6B7280',
      wip_limit: null,
    }),
  });

  if (!res || !res.ok) throw new Error('Erro ao criar coluna');

  return res.json();
}