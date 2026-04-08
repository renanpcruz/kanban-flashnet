'use client';

import { useEffect, useState } from 'react';
import { getCardById, addComment } from '../../lib/cards';
import { getCardHistory } from '../../lib/history';

export default function CardModal({ cardId, onClose }: any) {
  const [card, setCard] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    try {
      const cardData = await getCardById(cardId);
      setCard(cardData);

      const historyData = await getCardHistory(cardId);
      setHistory(historyData.items);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadAll();

    // 🔥 polling simples pra manter histórico atualizado (resolve move card)
    const interval = setInterval(() => {
      loadAll();
    }, 3000);

    return () => clearInterval(interval);
  }, [cardId]);

  async function handleComment() {
    if (comment.trim().length < 10) {
      alert('Comentário deve ter pelo menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);

      await addComment(cardId, comment);

      setComment('');

      await loadAll(); // 🔥 atualização imediata
    } catch (err) {
      console.error(err);
      alert('Erro ao comentar');
    } finally {
      setLoading(false);
    }
  }

  if (!card) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: '#1f1f2e',
          padding: '20px',
          borderRadius: '8px',
          width: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          color: 'white'
        }}
      >
        <h2>{card.title}</h2>
        <p>{card.description || 'Sem descrição'}</p>

        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          <p>⚡ Prioridade: {card.priority}</p>

          {card.assignee && (
            <p>👤 {card.assignee.username}</p>
          )}

          {card.due_date && (
            <p>📅 {card.due_date}</p>
          )}
        </div>

        {/* HISTÓRICO */}
        <div style={{ marginTop: '20px' }}>
          <h3>Histórico</h3>

          {history.length === 0 && <p>Sem histórico</p>}

          {history.map((h) => (
            <div
              key={h.id}
              style={{
                borderBottom: '1px solid #444',
                padding: '10px 0'
              }}
            >
              <strong>{h.performed_by?.username}</strong>

              <p style={{ fontSize: '12px', color: '#aaa' }}>
                {new Date(h.created_at).toLocaleString()}
              </p>

              {h.action === 'created' && <p>🟢 criou o card</p>}

              {h.action === 'moved' && (
                <p>
                  🔄 {h.from_column?.name} → {h.to_column?.name}
                </p>
              )}

              {h.action === 'commented' && (
                <p>💬 {h.observation}</p>
              )}

              {h.action === 'updated' && (
                <p>✏️ atualizou</p>
              )}

              {h.observation && h.action !== 'commented' && (
                <p style={{ fontStyle: 'italic' }}>
                  "{h.observation}"
                </p>
              )}
            </div>
          ))}
        </div>

        {/* COMENTAR */}
        <div style={{ marginTop: '20px' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário (mínimo 10 caracteres)"
            style={{ width: '100%', height: '80px' }}
          />

          <button onClick={handleComment} disabled={loading}>
            {loading ? 'Enviando...' : 'Comentar'}
          </button>
        </div>

        <button onClick={onClose} style={{ marginTop: '20px' }}>
          Fechar
        </button>
      </div>
    </div>
  );
}