'use client';

import { useState } from 'react';
import { createCard } from '../../lib/cards';
import styles from './CreateCardForm.module.css';

type Props = {
  boardId: string;
  columnId: string;
  onCreated: () => Promise<void> | void;
  canCreate: boolean;
};

export default function CreateCardForm({
  boardId,
  columnId,
  onCreated,
  canCreate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!canCreate) return;
    if (!title.trim()) return;

    try {
      setLoading(true);

      await createCard(boardId, columnId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags('');
      setOpen(false);

      await onCreated();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Erro ao criar card');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setOpen(false);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags('');
  }

  if (!canCreate) {
    return null;
  }

  if (!open) {
    return (
      <button
        className={styles.openButton}
        onClick={() => setOpen(true)}
        type="button"
      >
        + Adicionar card
      </button>
    );
  }

  return (
    <div className={styles.formCard}>
      <input
        className={styles.input}
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className={styles.textarea}
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className={styles.input}
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>

      <input
        className={styles.input}
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="Tags separadas por vírgula"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={handleCreate}
          disabled={loading}
          type="button"
        >
          {loading ? 'Criando...' : 'Criar'}
        </button>

        <button
          className={styles.secondaryButton}
          onClick={resetForm}
          disabled={loading}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}