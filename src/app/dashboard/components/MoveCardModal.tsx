'use client';

import { useState } from 'react';

export default function MoveCardModal({ onConfirm, onCancel }: any) {
  const [text, setText] = useState('');

  function handleConfirm() {
    if (!text.trim()) return alert('Observação obrigatória');

    onConfirm(text);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ background: '#1f1f2e', padding: '20px', color: 'white' }}>
        <h3>Movimentar Card</h3>

        <textarea
          placeholder="Digite a observação obrigatória"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '300px', height: '100px' }}
        />

        <br />

        <button onClick={handleConfirm}>Confirmar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}