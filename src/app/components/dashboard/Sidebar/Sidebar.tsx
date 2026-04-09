'use client';

import styles from './Sidebar.module.css';
import UserBadge from '../UserBadge/UserBadge';
import { useRouter, usePathname } from 'next/navigation';

type Props = {
  username: string;
  onLogout: () => void;
};

export default function Sidebar({ username, onLogout }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const isBoardsActive =
    pathname === '/dashboard' || pathname?.startsWith('/dashboard/');

  return (
    <aside className={styles.sidebar}>
      <div>
        <h1 className={styles.logo}>Kanban</h1>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${
              isBoardsActive ? styles.active : ''
            }`}
            onClick={() => router.push('/dashboard')}
            type="button"
          >
            Quadros
          </button>
        </nav>
      </div>

      <div className={styles.footer}>
        <UserBadge username={username} />

        <button className={styles.logoutButton} onClick={onLogout} type="button">
          Sair
        </button>
      </div>
    </aside>
  );
}