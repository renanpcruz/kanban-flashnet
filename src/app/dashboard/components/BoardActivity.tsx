'use client';

import { useEffect, useState } from 'react';
import { getBoardActivity } from '../../lib/boards';

export default function BoardActivity({ boardId }: any) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getBoardActivity(boardId);
      setActivities(data.items);
    }

    load();
  }, [boardId]);

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Atividade recente</h2>

      {activities.length === 0 && <p>Nenhuma atividade</p>}

      {activities.map((a) => (
        <div
          key={a.id}
          style={{
            borderBottom: '1px solid #444',
            padding: '10px 0'
          }}
        >
          <strong>{a.performed_by?.username}</strong>

          <p style={{ fontSize: '12px', color: '#aaa' }}>
            {new Date(a.created_at).toLocaleString()}
          </p>

          {/* EVENTOS */}
          {a.action === 'created' && (
            <p>🟢 criou o card "{a.card?.title}"</p>
          )}

          {a.action === 'moved' && (
            <p>
              🔄 moveu "{a.card?.title}" de{' '}
              <b>{a.from_column}</b> para <b>{a.to_column}</b>
            </p>
          )}

          {a.action === 'commented' && (
            <p>
              💬 comentou em "{a.card?.title}": {a.observation}
            </p>
          )}

          {a.action === 'updated' && (
            <p>✏️ atualizou "{a.card?.title}"</p>
          )}
        </div>
      ))}
    </div>
  );
}