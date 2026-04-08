'use client';

import { useState } from 'react';

type Props = {
  onCancel: () => void;
  onConfirm: (observation: string) => Promise<void> | void;
  loading?: boolean;
};

export default function MoveCardModal({
  onCancel,
  onConfirm,
  loading = false,
}: Props) {
  const [observation, setObservation] = useState('');

  const isInvalid = observation.trim().length < 10;

  async function handleConfirm() {
    if (isInvalid || loading) {
      return;
    }

    await onConfirm(observation.trim());
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#1f1f2e',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <h3>Movimentar card</h3>

        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
          A observação é obrigatória e precisa ter pelo menos 10 caracteres.
        </p>

        <textarea
          placeholder="Digite a observação"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            height: '100px',
            marginBottom: '8px',
            resize: 'vertical',
          }}
        />

        <p
          style={{
            fontSize: '12px',
            color: isInvalid ? '#ff7b7b' : '#8bd48b',
            marginBottom: '12px',
          }}
        >
          {observation.trim().length}/10 caracteres mínimos
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={onCancel} disabled={loading}>
            Cancelar
          </button>

          <button onClick={handleConfirm} disabled={isInvalid || loading}>
            {loading ? 'Movendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}