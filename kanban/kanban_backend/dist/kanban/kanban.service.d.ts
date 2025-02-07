import { Repository, DataSource } from 'typeorm';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
export declare class KanbanService {
    private columnRepository;
    private cardRepository;
    private dataSource;
    constructor(columnRepository: Repository<Column>, cardRepository: Repository<Card>, dataSource: DataSource);
    findAllColumns(): Promise<Column[]>;
    createColumn(createColumnDto: CreateColumnDto): Promise<Column>;
    deleteColumn(columnId: string): Promise<void>;
    createCard(columnId: string, createCardDto: CreateCardDto): Promise<Card>;
    deleteCard(cardId: string): Promise<void>;
    moveCard(cardId: string, moveCardDto: MoveCardDto): Promise<void>;
    updateColumnPositions(columns: Column[]): Promise<void>;
    updateCardPosition(cardId: string, newPosition: number): Promise<void>;
}
