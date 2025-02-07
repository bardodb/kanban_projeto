import { Card } from './card.interface';

export interface Column {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}
