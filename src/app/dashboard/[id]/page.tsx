'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { getBoardById, createColumn } from '../../lib/boards';
import { moveCard } from '../../lib/cards';
import { getBoardActivity } from '../../lib/history';

import { BoardDetails, Column, Card } from '../../lib/types';
import CardModal from '../components/CardModal';
import MoveCardModal from '../components/MoveCardModal';
import CreateCardForm from '../components/CreateCardForm';

type MoveData = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  targetPosition: number;
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

type DraggableCardProps = {
  card: Card;
  columnId: string;
  disabled: boolean;
  onOpen: (cardId: string) => void;
};

function DraggableCard({
  card,
  columnId,
  disabled,
  onOpen,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      disabled,
      data: {
        type: 'card',
        cardId: card.id,
        columnId,
      },
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(card.id)}
      style={{
        background: '#2e2e3f',
        padding: '10px',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.6 : isDragging ? 0.45 : 1,
        transform: CSS.Translate.toString(transform),
        transition: 'opacity 0.15s ease',
        border: isDragging ? '1px solid #6ea8fe' : '1px solid transparent',
        userSelect: 'none',
      }}
    >
      <strong>{card.title}</strong>

      <div style={{ fontSize: '12px', marginTop: '5px' }}>
        {card.assignee && <p>👤 {card.assignee.username}</p>}
        <p>⚡ {card.priority}</p>
        {card.due_date && <p>📅 {card.due_date}</p>}
      </div>

      <div style={{ marginTop: '5px' }}>
        {card.tags.map((tag, i) => (
          <span
            key={i}
            style={{
              fontSize: '10px',
              background: '#555',
              padding: '2px 6px',
              marginRight: '5px',
              borderRadius: '4px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

type DroppableColumnProps = {
  column: Column;
  children: React.ReactNode;
};

function DroppableColumn({ column, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  const isWipExceeded =
    column.wip_limit !== null &&
    column.wip_limit !== undefined &&
    column.cards.length >= column.wip_limit;

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '250px',
        background: isOver ? '#28283a' : '#1f1f2e',
        padding: '10px',
        borderRadius: '8px',
        border: isOver ? '2px solid #6ea8fe' : '2px solid transparent',
        transition: '0.15s ease',
      }}
    >
      <h3
        style={{
          color: isWipExceeded ? 'red' : column.color,
          marginBottom: '10px',
        }}
      >
        {column.name} ({column.cards.length}
        {column.wip_limit ? ` / ${column.wip_limit}` : ''})
      </h3>

      {children}
    </div>
  );
}

function findCardById(board: BoardDetails | null, cardId: string | null) {
  if (!board || !cardId) return null;

  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === cardId);
    if (card) return card;
  }

  return null;
}

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [moveData, setMoveData] = useState<MoveData | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [movingCard, setMovingCard] = useState(false);

  const [columnName, setColumnName] = useState('');
  const [creatingColumn, setCreatingColumn] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function loadBoard() {
    const data = await getBoardById(id as string);

    const normalized: BoardDetails = {
      ...data,
      columns: (data.columns || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((column) => ({
          ...column,
          cards: (column.cards || [])
            .filter((card) => !(card as any).is_archived)
            .slice()
            .sort((a, b) => a.position - b.position),
        })),
    };

    setBoard(normalized);
  }

  async function loadActivity() {
    const data = await getBoardActivity(id as string);
    setActivity(data.items || []);
  }

  async function reloadAll() {
    await Promise.all([loadBoard(), loadActivity()]);
  }

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await reloadAll();
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    }

    load();
  }, [id, router]);

  const activeCard = useMemo(
    () => findCardById(board, activeCardId),
    [board, activeCardId]
  );

  if (!board) return <p>Carregando...</p>;

  const isViewer = board.my_permission === 'viewer';
  const canEditCards = !isViewer;

  // Seu BoardDetails atual não traz role do usuário.
  // Então NÃO dá para saber com segurança se é admin.
  // Mantive desabilitado para não violar a regra do desafio.
  const canManageColumns = false;

  async function handleCreateColumn() {
    if (!columnName.trim()) return;

    try {
      setCreatingColumn(true);
      await createColumn(board.id, columnName.trim());
      setColumnName('');
      await reloadAll();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar coluna');
    } finally {
      setCreatingColumn(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type;
    if (type !== 'card') return;
    setActiveCardId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);

    if (!board || isViewer) return;

    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    if (activeType !== 'card') return;

    const cardId = String(active.id);
    const fromColumnId = String(active.data.current?.columnId || '');
    const toColumnId = String(over.data.current?.columnId || over.id);

    if (!fromColumnId || !toColumnId) return;
    if (fromColumnId === toColumnId) return;

    const sourceColumn = board.columns.find((c) => c.id === fromColumnId);
    const targetColumn = board.columns.find((c) => c.id === toColumnId);

    if (!sourceColumn || !targetColumn) return;

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
      fromColumnId,
      toColumnId,
      targetPosition: targetColumn.cards.length,
    });
  }

  function handleDragCancel() {
    setActiveCardId(null);
  }

  async function handleConfirmMove(observation: string) {
    if (!board || !moveData) return;

    try {
      setMovingCard(true);

      await moveCard(
        moveData.cardId,
        moveData.toColumnId,
        moveData.targetPosition,
        observation
      );

      setMoveData(null);
      await reloadAll();
    } catch (err) {
      console.error(err);
      alert('Erro ao mover card');
    } finally {
      setMovingCard(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{board.name}</h1>

      <p style={{ fontSize: '12px', color: '#aaa' }}>
        Permissão atual: {board.my_permission}
      </p>

      {isViewer && (
        <p style={{ color: 'orange' }}>
          Você tem permissão de visualização. Pode abrir e comentar cards, mas
          não pode mover nem editar.
        </p>
      )}

      {canManageColumns && (
        <div style={{ marginTop: '20px' }}>
          <h3>Criar coluna</h3>

          <input
            placeholder="Nome da coluna"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            style={{ marginRight: '10px' }}
          />

          <button onClick={handleCreateColumn} disabled={creatingColumn}>
            {creatingColumn ? 'Criando...' : 'Criar'}
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            marginTop: '20px',
            alignItems: 'flex-start',
          }}
        >
          {board.columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <DroppableColumn key={column.id} column={column}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '80px',
                  }}
                >
                  {column.cards
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((card) => (
                      <DraggableCard
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        disabled={!canEditCards}
                        onOpen={setSelectedCardId}
                      />
                    ))}

                  {column.cards.length === 0 && (
                    <div
                      style={{
                        border: '1px dashed #555',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '12px',
                        color: '#888',
                      }}
                    >
                      Solte um card aqui
                    </div>
                  )}
                </div>

                {canEditCards && (
                  <div style={{ marginTop: '12px' }}>
                    <CreateCardForm
                      boardId={board.id}
                      columnId={column.id}
                      onCreated={reloadAll}
                    />
                  </div>
                )}
              </DroppableColumn>
            ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div
              style={{
                background: '#2e2e3f',
                padding: '10px',
                borderRadius: '6px',
                width: 230,
                boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                border: '1px solid #6ea8fe',
              }}
            >
              <strong>{activeCard.title}</strong>

              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                {activeCard.assignee && <p>👤 {activeCard.assignee.username}</p>}
                <p>⚡ {activeCard.priority}</p>
                {activeCard.due_date && <p>📅 {activeCard.due_date}</p>}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div style={{ marginTop: '40px' }}>
        <h2>Atividade recente</h2>

        {activity.length === 0 && <p>Sem atividade</p>}

        {activity.map((a) => (
          <div
            key={a.id}
            style={{
              borderBottom: '1px solid #444',
              padding: '10px 0',
            }}
          >
            <strong>{a.performed_by?.username || 'Sistema'}</strong>

            <p style={{ fontSize: '12px', color: '#aaa' }}>
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
              <p style={{ fontStyle: 'italic' }}>"{a.observation}"</p>
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
          loading={movingCard}
          onCancel={() => {
            if (movingCard) return;
            setMoveData(null);
          }}
          onConfirm={handleConfirmMove}
        />
      )}
    </div>
  );
}