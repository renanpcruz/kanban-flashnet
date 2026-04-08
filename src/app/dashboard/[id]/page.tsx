'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter } from '@dnd-kit/core';

import { getBoardById, createColumn } from '../../lib/boards';
import { moveCard } from '../../lib/cards';
import { getBoardActivity } from '../../lib/history';

import { BoardDetails } from '../../lib/types';
import CardModal from '../components/CardModal';
import MoveCardModal from '../components/MoveCardModal';
import CreateCardForm from '../components/CreateCardForm';

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

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [moveData, setMoveData] = useState<MoveData | null>(null);

  const [columnName, setColumnName] = useState('');
  const [creatingColumn, setCreatingColumn] = useState(false);

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
        await reloadAll();
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    }

    load();
  }, [id, router]);

  if (!board) return <p>Carregando...</p>;

  console.log('PERMISSION:', board.my_permission);

  const isViewer = board.my_permission === 'viewer';

  // temporário para teste visual
  const isAdmin = true;
  const canEdit = true;

  async function handleCreateColumn() {
    if (!columnName.trim()) return;

    try {
      setCreatingColumn(true);

      await createColumn(board.id, columnName);

      setColumnName('');
      await reloadAll();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar coluna');
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

    const fromColumnId = active.data?.current?.columnId;
    if (fromColumnId === toColumnId) return;

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

  return (
    <div style={{ padding: '20px' }}>
      <h1>{board.name}</h1>

      <p style={{ fontSize: '12px', color: '#aaa' }}>
        Permissão atual: {board.my_permission}
      </p>

      {isViewer && (
        <p style={{ color: 'orange' }}>
          Você tem permissão de visualização (não pode mover cards)
        </p>
      )}

      {isAdmin && (
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            marginTop: '20px',
          }}
        >
          {board.columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const isWipExceeded =
                column.wip_limit !== null &&
                column.wip_limit !== undefined &&
                column.cards.length >= column.wip_limit;

              return (
                <div
                  key={column.id}
                  id={column.id}
                  style={{
                    minWidth: '250px',
                    background: '#1f1f2e',
                    padding: '10px',
                    borderRadius: '8px',
                  }}
                >
                  <h3
                    style={{
                      color: isWipExceeded ? 'red' : column.color,
                    }}
                  >
                    {column.name} ({column.cards.length}
                    {column.wip_limit ? ` / ${column.wip_limit}` : ''})
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '10px',
                    }}
                  >
                    {column.cards
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((card) => (
                        <div
                          key={card.id}
                          id={card.id}
                          data-column-id={column.id}
                          onClick={() => setSelectedCardId(card.id)}
                          style={{
                            background: '#2e2e3f',
                            padding: '10px',
                            borderRadius: '6px',
                            cursor: isViewer ? 'not-allowed' : 'grab',
                            opacity: isViewer ? 0.6 : 1,
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
                      ))}
                  </div>

                  {canEdit && (
                    <CreateCardForm
                      boardId={board.id}
                      columnId={column.id}
                      onCreated={reloadAll}
                    />
                  )}
                </div>
              );
            })}
        </div>
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
              <p style={{ fontStyle: 'italic' }}>
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
              alert('Erro ao mover card');
            }
          }}
        />
      )}
    </div>
  );
}