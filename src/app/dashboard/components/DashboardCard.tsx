type Props = {
  board: {
    id: string;
    name: string;
    description: string;
    my_permission: string;
    cards_count: number;
    members_count: number;
  };
  onClick?: () => void;
};

export default function DashboardCard({ board, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1f1f2e',
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
        border: '1px solid #333',
      }}
    >
      <h3 style={{ marginBottom: '8px' }}>{board.name}</h3>

      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '12px' }}>
        {board.description || 'Sem descrição'}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '14px',
        }}
      >
        <span>📌 Cards: {board.cards_count}</span>
        <span>👥 Pessoas no board: {board.members_count}</span>
        <span>🔐 Permissão: {board.my_permission}</span>
      </div>
    </div>
  );
}