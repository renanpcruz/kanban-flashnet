'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../../lib/auth';

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <aside style={{ width: '250px', background: '#222', color: '#fff', padding: '20px' }}>
      <h2>Kanban</h2>

      <nav>
        <ul>
          <li><Link href="/dashboard">Boards</Link></li>
        </ul>
      </nav>

      <button onClick={handleLogout}>Sair</button>
    </aside>
  );
}