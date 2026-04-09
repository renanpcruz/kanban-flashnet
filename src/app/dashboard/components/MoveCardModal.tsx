'use client';

import { useState } from 'react';
import styles from './MoveCardModal.module.css';

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
    if (isInvalid || loading) return;
    await onConfirm(observation.trim());
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Movimentar card</h3>

        <p className={styles.description}>
          A observação é obrigatória e precisa ter pelo menos 10 caracteres.
        </p>

        <textarea
          className={styles.textarea}
          placeholder="Digite a observação"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          disabled={loading}
        />

        <p
          className={`${styles.counter} ${
            isInvalid ? styles.invalid : styles.valid
          }`}
        >
          {observation.trim().length}/10 caracteres mínimos
        </p>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            className={styles.primaryButton}
            onClick={handleConfirm}
            disabled={isInvalid || loading}
          >
            {loading ? 'Movendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}