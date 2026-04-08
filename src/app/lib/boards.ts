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