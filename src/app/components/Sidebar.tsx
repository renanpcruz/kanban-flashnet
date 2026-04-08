'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth';

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await logout(); // ✅ sem argumento
    router.push('/login');
  }

  return (
    <aside style={{ width: '250px', backgroundColor: '#222', color: 'white', padding: '20px' }}>
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/dashboard/analytics">Analytics</Link></li>
          <li><Link href="/dashboard/settings">Configurações</Link></li>
          <li>
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}