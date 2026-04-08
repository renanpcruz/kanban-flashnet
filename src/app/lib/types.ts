export type BoardPermission = 'viewer' | 'editor';
export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

export interface UserRef {
  id: string;
  username: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  owner: UserRef;
  my_permission: BoardPermission;
  members_count: number;
  cards_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface BoardsResponse {
  items: Board[];
  total: number;
}

export interface Card {
  id: string;
  title: string;
  priority: CardPriority;
  assignee?: UserRef | null;
  position: number;
  due_date?: string | null;
  tags: string[];
  is_archived?: boolean;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
  wip_limit: number | null;
  cards: Card[];
}

export interface BoardDetails {
  id: string;
  name: string;
  my_permission: BoardPermission;
  columns: Column[];
}

export interface CardDetails {
  id: string;
  title: string;
  description?: string | null;
  column: {
    id: string;
    name: string;
  };
  board: {
    id: string;
    name: string;
  };
  priority: CardPriority;
  assignee?: UserRef | null;
  position: number;
  due_date?: string | null;
  tags: string[];
  created_by: UserRef;
  created_at: string;
  updated_at: string;
}