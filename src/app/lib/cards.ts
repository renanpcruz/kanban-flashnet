import { apiFetch } from './api';

export async function getCardById(cardId: string) {
  const res = await apiFetch(`/cards/${cardId}`);

  if (!res || !res.ok) {
    throw new Error('Erro ao buscar card');
  }

  return res.json();
}

export async function addComment(cardId: string, observation: string) {
  const res = await apiFetch(`/cards/${cardId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ observation }),
  });

  if (!res || !res.ok) {
    throw new Error('Erro ao comentar');
  }

  return res.json();
}

export async function moveCard(
  cardId: string,
  targetColumnId: string,
  position: number,
  observation: string
) {
  const res = await apiFetch(`/cards/${cardId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_column_id: targetColumnId,
      position,
      observation,
    }),
  });

  if (!res || !res.ok) {
    throw new Error('Erro ao mover card');
  }

  return res.json();
}

export async function createCard(
  boardId: string,
  columnId: string,
  payload: {
    title: string;
    description?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
    tags?: string[];
  }
) {
  const res = await apiFetch(`/boards/${boardId}/columns/${columnId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) {
    throw new Error('Erro ao criar card');
  }

  return res.json();
}

export async function updateCard(
  cardId: string,
  payload: {
    title?: string;
    description?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
    tags?: string[];
  }
) {
  const res = await apiFetch(`/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) {
    throw new Error('Erro ao atualizar card');
  }

  return res.json();
}

export async function archiveCard(cardId: string) {
  const res = await apiFetch(`/cards/${cardId}`, {
    method: 'DELETE',
  });

  if (!res || !res.ok) {
    throw new Error('Erro ao arquivar card');
  }

  return res.json();
}