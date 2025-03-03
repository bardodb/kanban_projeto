export interface Board {
  columns: Column[];
}

export interface Column {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  position: number;
  columnId: string;
  createdAt?: string;
  color?: string;
}
