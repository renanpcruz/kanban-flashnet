'use client';

import { useEffect, useState } from 'react';
import {
  getCardById,
  addComment,
  updateCard,
  archiveCard,
} from '../../lib/cards';
import { getCardHistory } from '../../lib/history';
import styles from './CardModal.module.css';

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

  async function loadAll(sync = false) {
    const cardData = await getCardById(cardId);
    setCard(cardData);

    if (sync) {
      setEditTitle(cardData.title || '');
      setEditDescription(cardData.description || '');
      setEditPriority(cardData.priority || 'medium');
      setEditDueDate(cardData.due_date || '');
      setEditTags(cardData.tags?.join(', ') || '');
    }

    const historyData = await getCardHistory(cardId);
    setHistory(historyData.items);
  }

  useEffect(() => {
    loadAll(true);
  }, [cardId]);

  async function handleComment() {
    if (comment.trim().length < 10) return;

    setLoading(true);
    await addComment(cardId, comment);
    setComment('');
    await loadAll();
    setLoading(false);
  }

  async function handleSaveEdit() {
    setLoading(true);

    await updateCard(cardId, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      due_date: editDueDate,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setEditing(false);
    await loadAll(true);
    setLoading(false);
  }

  async function handleArchive() {
    if (!confirm('Arquivar card?')) return;

    setLoading(true);
    await archiveCard(cardId);
    onArchived?.();
    onClose();
  }

  if (!card) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!editing ? (
          <>
            <h2 className={styles.title}>{card.title}</h2>

            <p className={styles.description}>
              {card.description || 'Sem descrição'}
            </p>

            <div className={styles.meta}>
              <span>⚡ {card.priority}</span>
              {card.assignee && <span>👤 {card.assignee.username}</span>}
              {card.due_date && <span>📅 {card.due_date}</span>}
            </div>

            <div className={styles.tags}>
              {card.tags?.map((tag: string, i: number) => (
                <span key={i} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles.actions}>
              <button onClick={() => setEditing(true)} className={styles.secondary}>
                Editar
              </button>

              <button onClick={handleArchive} className={styles.danger}>
                Arquivar
              </button>
            </div>
          </>
        ) : (
          <div className={styles.editBlock}>
            <h3>Editar</h3>

            <input
              className={styles.input}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <textarea
              className={styles.textarea}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <select
              className={styles.input}
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>

            <input
              className={styles.input}
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />

            <input
              className={styles.input}
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />

            <div className={styles.actions}>
              <button onClick={handleSaveEdit} className={styles.primary}>
                Salvar
              </button>

              <button onClick={() => setEditing(false)} className={styles.secondary}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3>Histórico</h3>

          {history.map((h) => (
            <div key={h.id} className={styles.historyItem}>
              <strong>{h.performed_by?.username}</strong>

              <p className={styles.date}>
                {new Date(h.created_at).toLocaleString()}
              </p>

              <p>{h.action}</p>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <textarea
            className={styles.textarea}
            placeholder="Comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button onClick={handleComment} className={styles.primary}>
            Comentar
          </button>
        </div>

        <button onClick={onClose} className={styles.close}>
          Fechar
        </button>
      </div>
    </div>
  );
}