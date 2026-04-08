export interface Board {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    username: string;
  };
  my_permission: string;
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
  priority: string;
  assignee?: {
    id: string;
    username: string;
  };
  position: number;
  due_date: string;
  tags: string[];
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
  my_permission: string;
  columns: Column[];
}