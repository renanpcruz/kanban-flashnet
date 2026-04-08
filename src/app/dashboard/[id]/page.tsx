'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBoardById } from '../../lib/boards';
import { BoardDetails } from '../../lib/types';
import CardModal from '../components/CardModal';
import MoveCardModal from '../components/MoveCardModal';
import { moveCard } from '../../lib/cards';

import {
  DndContext,
  closestCenter
} from '@dnd-kit/core';

import BoardActivity from '../components/BoardActivity';

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [moveData, setMoveData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await getBoardById(id as string);
        setBoard(data);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    }

    load();
  }, [id, router]);

  if (!board) return <p>Carregando...</p>;

  const isViewer = board.my_permission === 'viewer';

  function handleDragEnd(event: any) {
    if (isViewer) return;

    const { active, over } = event;
    if (!over) return;

    const cardId = active.id;
    const toColumnId = over.id;

    const fromColumnId = active.data?.current?.columnId;
    if (fromColumnId === toColumnId) return;

    const targetColumn = board.columns.find(
      (c) => c.id === toColumnId
    );

    if (!targetColumn) return;

    const isWipExceeded =
      targetColumn.wip_limit &&
      targetColumn.cards.length >= targetColumn.wip_limit;

    if (isWipExceeded) {
      alert('WIP limit atingido nessa coluna');
      return;
    }

    setMoveData({
      cardId,
      toColumnId
    });
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{board.name}</h1>

      {isViewer && (
        <p style={{ color: 'orange' }}>
          Você tem permissão de visualização (não pode mover cards)
        </p>
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
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const isWipExceeded =
                column.wip_limit &&
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
                      color: isWipExceeded ? 'red' : column.color
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
                            opacity: isViewer ? 0.6 : 1
                          }}
                        >
                          <strong>{card.title}</strong>

                          <div style={{ fontSize: '12px', marginTop: '5px' }}>
                            {card.assignee && (
                              <p>👤 {card.assignee.username}</p>
                            )}

                            <p>⚡ {card.priority}</p>

                            {card.due_date && (
                              <p>📅 {card.due_date}</p>
                            )}
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
                </div>
              );
            })}
        </div>
      </DndContext>

      {/* MODAL DETALHE CARD */}
      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}

      {/* MODAL DE MOVIMENTO */}
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

              const updated = await getBoardById(id as string);
              setBoard(updated);

              setMoveData(null);
            } catch (err: any) {
              console.error(err);
              alert('Erro ao mover card');
            }
          }}
        />
      )}

      <BoardActivity boardId={id as string} />
    </div>
  );
}