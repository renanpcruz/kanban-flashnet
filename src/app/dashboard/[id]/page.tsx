'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBoardById } from '../../lib/boards';
import { BoardDetails } from '../../lib/types';

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<BoardDetails | null>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await getBoardById(id as string);
        setBoard(data);
      } catch {
        router.push('/login');
      }
    }

    load();
  }, [id, router]);

  if (!board) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{board.name}</h1>

      {/* KANBAN */}
      <div style={{
        display: 'flex',
        gap: '20px',
        overflowX: 'auto',
        paddingTop: '20px'
      }}>
        {board.columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <div
              key={column.id}
              style={{
                minWidth: '250px',
                background: '#1f1f2e',
                padding: '10px',
                borderRadius: '8px'
              }}
            >
              {/* COLUMN HEADER */}
              <h3 style={{ color: column.color }}>
                {column.name}
              </h3>

              {/* CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {column.cards
                  .sort((a, b) => a.position - b.position)
                  .map((card) => (
                    <div
                      key={card.id}
                      style={{
                        background: '#2e2e3f',
                        padding: '10px',
                        borderRadius: '6px'
                      }}
                    >
                      <strong>{card.title}</strong>

                      <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        {card.assignee && (
                          <p>👤 {card.assignee.username}</p>
                        )}

                        <p>⚡ {card.priority}</p>

                        {card.due_date && (
                          <p>📅 {card.due_date}</p>
                        )}
                      </div>

                      {/* TAGS */}
                      <div style={{ marginTop: '5px' }}>
                        {card.tags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '10px',
                              background: '#555',
                              padding: '2px 6px',
                              marginRight: '5px',
                              borderRadius: '4px'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}