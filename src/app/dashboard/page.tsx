'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBoards } from '../lib/boards';
import { Board } from '../lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoards() {
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
      } finally {
        setLoading(false);
      }
    }

    loadBoards();
  }, [router]);

  if (loading) return <p>Carregando boards...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Boards</h1>

      {boards.length === 0 && <p>Nenhum board encontrado</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => router.push(`/dashboard/${board.id}`)} // ✅ clique aqui
            style={{
              background: '#2E2E3F',
              padding: '20px',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer', // ✅ feedback visual
              transition: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3A3A5A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2E2E3F';
            }}
          >
            <h3>{board.name}</h3>

            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              {board.description || 'Sem descrição'}
            </p>

            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <p>{board.cards_count} cards</p>
              <p>{board.members_count} membros</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}