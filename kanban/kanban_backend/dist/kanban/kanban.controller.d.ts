import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
    getBoard(): Promise<{
        columns: Column[];
    }>;
    createColumn(createColumnDto: CreateColumnDto): Promise<Column>;
    deleteColumn(columnId: string): Promise<void>;
    updateColumnPositions(data: {
        columns: Column[];
    }): Promise<void>;
    createCard(columnId: string, createCardDto: CreateCardDto): Promise<Card>;
    deleteCard(cardId: string): Promise<void>;
    moveCard(cardId: string, moveCardDto: MoveCardDto): Promise<void>;
    updateCardPosition(cardId: string, position: number): Promise<{
        success: boolean;
    }>;
}
