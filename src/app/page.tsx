'use client';

import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Kanban</h1>

        <button
          className={styles.primaryButton}
          onClick={() => router.push('/login')}
        >
          Acessar sistema
        </button>
      </div>
    </div>
  );
}