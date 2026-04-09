'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DashboardPage.module.css';
import { getBoards, createBoard } from '../lib/boards';
import { getMe } from '../lib/auth';
import Sidebar from '../components/dashboard/Sidebar/Sidebar';
import BoardCard from '../components/dashboard/BoardCard/BoardCard';

type Board = {
  id: string;
  name: string;
  description: string;
  cards_count: number;
  members_count: number;
  my_permission: string;
};

type Me = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  is_active: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [me, setMe] = useState<Me | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const [boardsData, meData] = await Promise.all([
          getBoards(),
          getMe(),
        ]);

        setBoards(boardsData.items);
        setMe(meData);
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    }

    load();
  }, [router]);

  async function handleCreateBoard() {
    if (!name.trim()) return;
    if (me?.role !== 'admin') return;

    try {
      setLoading(true);

      await createBoard(name.trim(), description.trim() || undefined);

      const data = await getBoards();
      setBoards(data.items);

      setName('');
      setDescription('');
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Erro ao criar board');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace('/login');
  }

  const isAdmin = me?.role === 'admin';

  return (
    <div className={styles.page}>
      <Sidebar
        username={me?.username || 'Usuário'}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.greeting}>
            Olá, {me?.username || 'Usuário'}
          </h2>
          <h1 className={styles.title}>Seus quadros</h1>
        </div>

        {isAdmin && (
          <div className={styles.createBoardBox}>
            <h3 className={styles.createBoardTitle}>Criar novo board</h3>

            <div className={styles.createBoardRow}>
              <input
                className={styles.input}
                placeholder="Nome do board"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className={styles.input}
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button
                className={styles.primaryButton}
                onClick={handleCreateBoard}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        )}

        <div className={styles.boardList}>
          {boards.length === 0 && (
            <p className={styles.empty}>Nenhum board encontrado.</p>
          )}

          {boards.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              name={board.name}
              description={board.description}
              cardsCount={board.cards_count}
              membersCount={board.members_count}
              permission={board.my_permission}
              onClick={() => router.push(`/dashboard/${board.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}