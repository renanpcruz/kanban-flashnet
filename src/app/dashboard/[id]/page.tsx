'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { getBoardById, createColumn } from '../../lib/boards';
import { moveCard } from '../../lib/cards';
import { getBoardActivity } from '../../lib/history';

import { BoardDetails } from '../../lib/types';
import CardModal from '../components/CardModal';
import MoveCardModal from '../components/MoveCardModal';
import CreateCardForm from '../components/CreateCardForm';
import styles from './BoardPage.module.css';

import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import { getMe } from '../../lib/auth';

type MoveData = {
  cardId: string;
  toColumnId: string;
};

type ActivityItem = {
  id: string;
  action: string;
  observation?: string | null;
  from_column?: string | null;
  to_column?: string | null;
  created_at: string;
  performed_by?: {
    username: string;
  };
  card?: {
    id: string;
    title: string;
  };
};

type CardType = {
  id: string;
  title: string;
  priority: string;
  due_date?: string | null;
  position: number;
  assignee?: {
    username: string;
  } | null;
  tags: string[];
};

type ColumnType = {
  id: string;
  name: string;
  color: string;
  position: number;
  wip_limit?: number | null;
  cards: CardType[];
};

function DraggableCard({
  card,
  columnId,
  isViewer,
  onClick,
}: {
  card: CardType;
  columnId: string;
  isViewer: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        columnId,
        type: 'card',
      },
      disabled: isViewer,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isViewer ? 'not-allowed' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <h4 className={styles.cardTitle}>{card.title}</h4>

      <div className={styles.cardMeta}>
        {card.assignee && <p>👤 {card.assignee.username}</p>}
        <p>⚡ {card.priority}</p>
        {card.due_date && <p>📅 {card.due_date}</p>}
      </div>

      <div style={{ marginTop: '8px' }}>
        {card.tags.map((tag, i) => (
          <span key={i} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  children,
}: {
  column: ColumnType;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  const isWipExceeded =
    column.wip_limit !== null &&
    column.wip_limit !== undefined &&
    column.cards.length >= column.wip_limit;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnHover : ''}`}
    >
      <h3
        className={styles.columnTitle}
        style={{ color: isWipExceeded ? '#dc2626' : '#0f4675' }}
      >
        {column.name} ({column.cards.length}
        {column.wip_limit ? ` / ${column.wip_limit}` : ''})
      </h3>

      {children}
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [moveData, setMoveData] = useState<MoveData | null>(null);

  const [columnName, setColumnName] = useState('');
  const [creatingColumn, setCreatingColumn] = useState(false);

  const [me, setMe] = useState<{
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  is_active: boolean;
  created_at: string;
} | null>(null);

  async function loadBoard() {
    const data = await getBoardById(id as string);
    setBoard(data);
  }

  async function loadActivity() {
    const data = await getBoardActivity(id as string);
    setActivity(data.items);
  }

  async function reloadAll() {
    await loadBoard();
    await loadActivity();
  }

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const [meData] = await Promise.all([
  getMe(),
  reloadAll(),
]);

setMe(meData);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    }

    load();
  }, [id, router]);

  if (!board) return <p className={styles.loading}>Carregando...</p>;

  const isViewer = board.my_permission === 'viewer';
  const canEdit = !isViewer;

  // Ligue isso ao role real quando buscar /auth/me
  const canManageColumns = false;

  async function handleCreateColumn() {
    if (!columnName.trim()) return;

    try {
      setCreatingColumn(true);

      await createColumn(
        board.id,
        columnName.trim(),
        board.columns.length
      );

      setColumnName('');
      await reloadAll();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Erro ao criar coluna');
    } finally {
      setCreatingColumn(false);
    }
  }

  function handleDragEnd(event: any) {
    if (!board) return;
    if (isViewer) return;

    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const toColumnId = String(over.id);
    const fromColumnId = String(active.data?.current?.columnId || '');

    if (!fromColumnId || fromColumnId === toColumnId) return;

    const targetColumn = board.columns.find((c) => c.id === toColumnId);
    if (!targetColumn) return;

    const isWipExceeded =
      targetColumn.wip_limit !== null &&
      targetColumn.wip_limit !== undefined &&
      targetColumn.cards.length >= targetColumn.wip_limit;

    if (isWipExceeded) {
      alert('WIP limit atingido nessa coluna');
      return;
    }

    setMoveData({
      cardId,
      toColumnId,
    });
  }

  function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  router.push('/login');
}

  return (
  <div className={styles.layout}>
    <Sidebar
      username={me?.username || 'Usuário'}
      onLogout={handleLogout}
    />

    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{board.name}</h1>

        <p className={styles.permission}>
          Permissão: {board.my_permission}
        </p>

        {isViewer && (
          <p className={styles.warning}>
            Você só pode visualizar este board.
          </p>
        )}
      </div>

      {canManageColumns && (
        <div className={styles.createColumnBox}>
          <h3 className={styles.createColumnTitle}>Criar coluna</h3>

          <div className={styles.createColumnRow}>
            <input
              className={styles.input}
              placeholder="Nome da coluna"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />

            <button
              className={styles.primaryButton}
              onClick={handleCreateColumn}
              disabled={creatingColumn}
            >
              {creatingColumn ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.columns}>
          {board.columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <DroppableColumn key={column.id} column={column}>
                <div className={styles.cardsList}>
                  {column.cards
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((card) => (
                      <DraggableCard
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        isViewer={isViewer}
                        onClick={() => setSelectedCardId(card.id)}
                      />
                    ))}
                </div>

                {canEdit && (
                  <div style={{ marginTop: '12px' }}>
                    <CreateCardForm
                      boardId={board.id}
                      columnId={column.id}
                      onCreated={reloadAll}
                      canCreate={board.my_permission === 'editor'}
                    />
                  </div>
                )}
              </DroppableColumn>
            ))}
        </div>
      </DndContext>

      <div className={styles.activitySection}>
        <h2 className={styles.activityTitle}>Atividade recente</h2>

        {activity.length === 0 && (
          <p className={styles.emptyActivity}>Sem atividade</p>
        )}

        {activity.map((a) => (
          <div key={a.id} className={styles.activityItem}>
            <strong>{a.performed_by?.username || 'Sistema'}</strong>

            <p className={styles.activityDate}>
              {new Date(a.created_at).toLocaleString()}
            </p>

            {a.card?.title && <p>📌 {a.card.title}</p>}
            {a.action === 'created' && <p>🟢 criou o card</p>}
            {a.action === 'moved' && (
              <p>
                🔄 {a.from_column} → {a.to_column}
              </p>
            )}
            {a.action === 'commented' && <p>💬 {a.observation}</p>}
            {a.action === 'updated' && <p>✏️ atualizou o card</p>}

            {a.observation && a.action !== 'commented' && (
              <p className={styles.activityObservation}>
                "{a.observation}"
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
          onArchived={reloadAll}
        />
      )}

      {moveData && (
        <MoveCardModal
          onCancel={() => setMoveData(null)}
          onConfirm={async (observation: string) => {
            try {
              await moveCard(
                moveData.cardId,
                moveData.toColumnId,
                0,
                observation
              );

              setMoveData(null);
              await reloadAll();
            } catch (err) {
              console.error(err);
              alert((err as Error).message || 'Erro ao mover card');
            }
          }}
        />
      )}
    </main>
  </div>
);
}