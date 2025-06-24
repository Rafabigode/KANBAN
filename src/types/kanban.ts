
export interface Card {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanStore {
  boards: Board[];
  activeBoard: string | null;
}
