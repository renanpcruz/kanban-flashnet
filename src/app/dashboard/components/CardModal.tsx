'use client';

import { useEffect, useState } from 'react';
import {
  getCardById,
  addComment,
  updateCard,
  archiveCard
} from '../../lib/cards';
import { getCardHistory } from '../../lib/history';

type Props = {
  cardId: string;
  onClose: () => void;
  onArchived?: () => Promise<void> | void;
};

export default function CardModal({ cardId, onClose, onArchived }: Props) {
  const [card, setCard] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTags, setEditTags] = useState('');

  async function loadHistory() {
    try {
      const historyData = await getCardHistory(cardId);
      setHistory(historyData.items);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCard(syncForm = false) {
    try {
      const cardData = await getCardById(cardId);
      setCard(cardData);

      if (syncForm) {
        setEditTitle(cardData.title || '');
        setEditDescription(cardData.description || '');
        setEditPriority(cardData.priority || 'medium');
        setEditDueDate(cardData.due_date || '');
        setEditTags(Array.isArray(cardData.tags) ? cardData.tags.join(', ') : '');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAll(syncForm = false) {
    await loadCard(syncForm);
    await loadHistory();
  }

  useEffect(() => {
    loadAll(true);
  }, [cardId]);

  useEffect(() => {
    if (editing) return;

    const interval = setInterval(() => {
      loadAll(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [cardId, editing]);

  async function handleComment() {
    if (comment.trim().length < 10) {
      alert('Comentário deve ter pelo menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);
      await addComment(cardId, comment);
      setComment('');
      await loadAll(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao comentar');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) {
      alert('Título é obrigatório');
      return;
    }

    try {
      setLoading(true);

      await updateCard(cardId, {
        title: editTitle.trim(),
        description: editDescription.trim() || '',
        priority: editPriority,
        due_date: editDueDate || '',
        tags: editTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setEditing(false);
      await loadAll(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar card');
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    const confirmed = window.confirm('Tem certeza que deseja arquivar este card?');
    if (!confirmed) return;

    try {
      setLoading(true);

      await archiveCard(cardId);

      if (onArchived) {
        await onArchived();
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao arquivar card');
    } finally {
      setLoading(false);
    }
  }

  function handleStartEdit() {
    if (!card) return;

    setEditTitle(card.title || '');
    setEditDescription(card.description || '');
    setEditPriority(card.priority || 'medium');
    setEditDueDate(card.due_date || '');
    setEditTags(Array.isArray(card.tags) ? card.tags.join(', ') : '');
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);

    if (!card) return;

    setEditTitle(card.title || '');
    setEditDescription(card.description || '');
    setEditPriority(card.priority || 'medium');
    setEditDueDate(card.due_date || '');
    setEditTags(Array.isArray(card.tags) ? card.tags.join(', ') : '');
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
        {!editing ? (
          <>
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

            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
              <button onClick={handleStartEdit}>
                Editar card
              </button>

              <button onClick={handleArchive} disabled={loading}>
                {loading ? 'Arquivando...' : 'Arquivar card'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <h3>Editar card</h3>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
              style={{ width: '100%', marginBottom: '8px' }}
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descrição"
              style={{ width: '100%', height: '80px', marginBottom: '8px' }}
            />

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              style={{ width: '100%', marginBottom: '8px' }}
            />

            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags separadas por vírgula"
              style={{ width: '100%', marginBottom: '8px' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>

              <button onClick={handleCancelEdit} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        )}

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

              {h.action === 'archived' && (
                <p>📦 arquivou o card</p>
              )}

              {h.observation && h.action !== 'commented' && (
                <p style={{ fontStyle: 'italic' }}>
                  "{h.observation}"
                </p>
              )}
            </div>
          ))}
        </div>

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