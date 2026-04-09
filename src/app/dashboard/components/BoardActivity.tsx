'use client';

import { useEffect, useState } from 'react';
import { getBoardActivity } from '../../lib/boards';
import styles from './BoardActivity.module.css';

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
    <div className={styles.container}>
      <h2 className={styles.title}>Atividade recente</h2>

      {activities.length === 0 && (
        <p className={styles.empty}>Nenhuma atividade</p>
      )}

      <div className={styles.list}>
        {activities.map((a) => (
          <div key={a.id} className={styles.item}>
            <div className={styles.header}>
              <strong className={styles.user}>
                {a.performed_by?.username || 'Sistema'}
              </strong>

              <span className={styles.date}>
                {new Date(a.created_at).toLocaleString()}
              </span>
            </div>

            <div className={styles.content}>
              {a.action === 'created' && (
                <p>
                  🟢 criou o card <b>"{a.card?.title}"</b>
                </p>
              )}

              {a.action === 'moved' && (
                <p>
                  🔄 moveu <b>"{a.card?.title}"</b> de{' '}
                  <span className={styles.highlight}>{a.from_column}</span> para{' '}
                  <span className={styles.highlight}>{a.to_column}</span>
                </p>
              )}

              {a.action === 'commented' && (
                <p>
                  💬 comentou em <b>"{a.card?.title}"</b>
                </p>
              )}

              {a.action === 'updated' && (
                <p>
                  ✏️ atualizou <b>"{a.card?.title}"</b>
                </p>
              )}
            </div>

            {a.observation && (
              <p className={styles.observation}>
                "{a.observation}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}