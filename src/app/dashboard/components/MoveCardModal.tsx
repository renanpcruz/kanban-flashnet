'use client';

import { useState } from 'react';

type Props = {
  onCancel: () => void;
  onConfirm: (observation: string) => void;
};

export default function MoveCardModal({ onCancel, onConfirm }: Props) {
  const [observation, setObservation] = useState('');

  function handleConfirm() {
    if (observation.trim().length < 10) {
      alert('A observação deve ter pelo menos 10 caracteres');
      return;
    }

    onConfirm(observation);
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          background: '#1f1f2e',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
        }}
      >
        <h3>Movimentar Card</h3>

        <textarea
          placeholder="Digite a observação (mínimo 10 caracteres)"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          style={{ width: '100%', height: '80px', marginBottom: '10px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onCancel}>
            Cancelar
          </button>

          <button onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}