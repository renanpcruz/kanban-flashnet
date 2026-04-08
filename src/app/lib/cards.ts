const API_BASE = 'https://renan.flashnetbrasil.com.br/api/v1';

import { apiFetch } from './api';

export async function getCardById(id: string) {
  const res = await apiFetch(`/cards/${id}`);

  if (!res || !res.ok) throw new Error('Erro ao buscar card');

  return res.json();
}

export async function addComment(cardId: string, content: string) {
  const res = await apiFetch(`/cards/${cardId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ observation: content }), // ✅ CORRETO
  });

  const data = await res?.json();

  if (!res || !res.ok) {
    console.error(data);
    throw new Error('Erro ao comentar');
  }

  return data;
}

export async function moveCard(
  cardId: string,
  toColumnId: string,
  position: number,
  observation: string
) {
  const res = await apiFetch(`/cards/${cardId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to_column_id: toColumnId,
      position,
      observation
    })
  });

  if (!res || !res.ok) throw new Error('Erro ao mover card');

  return res.json();
}

export async function getCardHistory(cardId: string) {
  const res = await apiFetch(`/cards/${cardId}/history`);

  if (!res || !res.ok) throw new Error('Erro ao buscar histórico');

  return res.json();
}