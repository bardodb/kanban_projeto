import { Column as KanbanColumn } from './column.entity';
export declare class Card {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    columnId: string;
    position: number;
    column: KanbanColumn;
}
