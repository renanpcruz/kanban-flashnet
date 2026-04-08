'use client';

import { useState } from 'react';
import { createCard } from '../../lib/cards';

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
        onClick={() => setOpen(true)}
        style={{
          marginTop: '10px',
          width: '100%',
        }}
      >
        + Adicionar card
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: '10px',
        background: '#2a2a3a',
        padding: '10px',
        borderRadius: '6px',
      }}
    >
      <input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '100%', height: '70px', marginBottom: '8px' }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      >
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <input
        placeholder="Tags separadas por vírgula"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleCreate} disabled={loading}>
          {loading ? 'Criando...' : 'Criar'}
        </button>

        <button onClick={resetForm} disabled={loading}>
          Cancelar
        </button>
      </div>
    </div>
  );
}