'use client';

import { useEffect, useState } from 'react';
import {
  getCardById,
  getCardHistory,
  addComment
} from '../../lib/cards';

export default function CardModal({ cardId, onClose }: any) {
  const [card, setCard] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function load() {
      const cardData = await getCardById(cardId);
      setCard(cardData);

      const historyData = await getCardHistory(cardId);
      setHistory(historyData.items);
    }

    load();
  }, [cardId]);

  async function handleComment() {
    if (comment.trim().length < 10) {
      alert('Comentário deve ter pelo menos 10 caracteres');
      return;
    }

    await addComment(cardId, comment);

    setComment('');

    // 🔥 atualiza histórico
    const historyData = await getCardHistory(cardId);
    setHistory(historyData.items);
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
        {/* HEADER */}
        <h2>{card.title}</h2>

        <p>{card.description || 'Sem descrição'}</p>

        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          <p>⚡ Prioridade: {card.priority}</p>

          {card.assignee && (
            <p>👤 Responsável: {card.assignee.username}</p>
          )}

          {card.due_date && (
            <p>📅 Prazo: {card.due_date}</p>
          )}
        </div>

        {/* TAGS */}
        <div style={{ marginTop: '10px' }}>
          {card.tags?.map((tag: string, i: number) => (
            <span
              key={i}
              style={{
                fontSize: '10px',
                background: '#555',
                padding: '3px 6px',
                marginRight: '5px',
                borderRadius: '4px'
              }}
            >
              {tag}
            </span>
          ))}
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

              {h.action === 'created' && (
                <p>🟢 criou o card</p>
              )}

              {h.action === 'moved' && (
                <p>
                  🔄 moveu de <b>{h.from_column?.name}</b> para{' '}
                  <b>{h.to_column?.name}</b>
                </p>
              )}

              {h.action === 'commented' && (
                <p>💬 {h.observation}</p>
              )}

              {h.action === 'updated' && (
                <p>✏️ atualizou o card</p>
              )}

              {h.observation && h.action !== 'commented' && (
                <p style={{ fontStyle: 'italic', marginTop: '5px' }}>
                  "{h.observation}"
                </p>
              )}
            </div>
          ))}
        </div>

        {/* COMENTAR */}
        <div style={{ marginTop: '20px' }}>
          <h4>Adicionar comentário</h4>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Digite um comentário (mínimo 10 caracteres)"
            style={{
              width: '100%',
              height: '80px',
              marginTop: '5px'
            }}
          />

          <button
            onClick={handleComment}
            style={{ marginTop: '10px' }}
          >
            Comentar
          </button>
        </div>

        {/* FECHAR */}
        <button
          onClick={onClose}
          style={{ marginTop: '20px' }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}