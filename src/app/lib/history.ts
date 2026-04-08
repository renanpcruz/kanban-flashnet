import { apiFetch } from './api';

export async function getCardHistory(cardId: string) {
  const res = await apiFetch(`/cards/${cardId}/history?per_page=50`);

  if (!res || !res.ok) {
    throw new Error('Erro ao buscar histórico');
  }

  return res.json();
}

export async function getBoardActivity(boardId: string) {
  const res = await apiFetch(`/boards/${boardId}/activity?limit=20`);

  if (!res || !res.ok) {
    throw new Error('Erro ao buscar atividade');
  }

  return res.json();
}