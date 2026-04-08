'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBoards, createBoard } from '../lib/boards';

type Board = {
  id: string;
  name: string;
  description: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await getBoards();
        setBoards(data.items);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    }

    load();
  }, [router]);

  async function handleCreateBoard() {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const newBoard = await createBoard(name, description);

      // adiciona direto na lista (melhor UX)
      setBoards((prev) => [newBoard, ...prev]);

      setName('');
      setDescription('');
    } catch (err: any) {
      console.error(err);

      if (err?.message?.includes('403')) {
        alert('Apenas admin pode criar boards');
      } else {
        alert('Erro ao criar board');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      {/* CRIAR BOARD */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Criar novo board</h2>

        <input
          placeholder="Nome do board"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '10px' }}
        />

        <input
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: '10px' }}
        />

        <button onClick={handleCreateBoard} disabled={loading}>
          {loading ? 'Criando...' : 'Criar'}
        </button>
      </div>

      {/* LISTA DE BOARDS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => router.push(`/dashboard/${board.id}`)}
            style={{
              border: '1px solid #ccc',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '200px',
            }}
          >
            <h3>{board.name}</h3>
            <p style={{ fontSize: '12px' }}>
              {board.description || 'Sem descrição'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}