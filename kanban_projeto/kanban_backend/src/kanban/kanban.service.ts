import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
  ) {}

  async findAllColumns(): Promise<Column[]> {
    const columns = await this.columnRepository.find({
      order: {
        position: 'ASC',
      },
      relations: ['cards'],
    });

    // Sort cards within each column
    columns.forEach(column => {
      if (column.cards) {
        column.cards.sort((a, b) => a.position - b.position);
      }
    });

    return columns;
  }

  async createColumn(createColumnDto: CreateColumnDto): Promise<Column> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Encontrar a última coluna usando order by e take(1)
      const lastColumn = await queryRunner.manager
        .createQueryBuilder(Column, "column")
        .orderBy("column.position", "DESC")
        .take(1)
        .getOne();

      const position = lastColumn ? lastColumn.position + 1 : 0;

      const column = queryRunner.manager.create(Column, {
        ...createColumnDto,
        position,
        cards: []
      });

      const savedColumn = await queryRunner.manager.save(Column, column);
      await queryRunner.commitTransaction();
      
      // Garantir que o array cards está inicializado
      if (!savedColumn.cards) {
        savedColumn.cards = [];
      }
      
      return savedColumn;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteColumn(columnId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const column = await queryRunner.manager.findOneOrFail(Column, {
        where: { id: columnId },
        relations: ['cards'],
      });

      // Delete all cards in the column
      if (column.cards.length > 0) {
        await queryRunner.manager.remove(column.cards);
      }

      // Delete the column
      await queryRunner.manager.remove(column);

      // Update positions of remaining columns
      await queryRunner.manager.createQueryBuilder()
        .update(Column)
        .set({
          position: () => 'position - 1'
        })
        .where('position > :position', { position: column.position })
        .execute();

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createCard(columnId: string, createCardDto: CreateCardDto): Promise<Card> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const column = await queryRunner.manager.findOneOrFail(Column, {
        where: { id: columnId }
      });

      const lastCard = await queryRunner.manager
        .createQueryBuilder(Card, "card")
        .where("card.columnId = :columnId", { columnId })
        .orderBy("card.position", "DESC")
        .take(1)
        .getOne();

      const position = lastCard ? lastCard.position + 1 : 0;

      const card = queryRunner.manager.create(Card, {
        ...createCardDto,
        columnId,
        column,
        position,
      });

      const savedCard = await queryRunner.manager.save(Card, card);
      await queryRunner.commitTransaction();
      return savedCard;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const card = await queryRunner.manager.findOneOrFail(Card, {
        where: { id: cardId },
        relations: ['column'],
      });

      const columnId = card.columnId;

      // Delete the card
      await queryRunner.manager.remove(card);

      // Update positions of remaining cards in the same column
      await queryRunner.manager
        .createQueryBuilder()
        .update(Card)
        .set({
          position: () => 'position - 1'
        })
        .where('columnId = :columnId AND position > :position', {
          columnId,
          position: card.position
        })
        .execute();

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async moveCard(cardId: string, moveCardDto: MoveCardDto): Promise<void> {
    const { fromColumnId, toColumnId, position } = moveCardDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const card = await queryRunner.manager.findOne(Card, {
        where: { id: cardId },
        relations: ['column'],
      });

      if (!card) {
        throw new NotFoundException(`Card with ID ${cardId} not found`);
      }

      if (card.columnId !== fromColumnId) {
        throw new NotFoundException(`Card ${cardId} is not in column ${fromColumnId}`);
      }

      const oldPosition = card.position;

      // Update positions in the source column
      await queryRunner.manager.createQueryBuilder()
        .update(Card)
        .set({
          position: () => 'position - 1'
        })
        .where('columnId = :columnId AND position > :position', {
          columnId: fromColumnId,
          position: oldPosition,
        })
        .execute();

      // Update positions in target column to make space for the new card
      await queryRunner.manager.createQueryBuilder()
        .update(Card)
        .set({
          position: () => 'position + 1'
        })
        .where('columnId = :columnId AND position >= :position', {
          columnId: toColumnId,
          position,
        })
        .execute();

      // Update the card's column and position
      await queryRunner.manager.update(Card, cardId, {
        columnId: toColumnId,
        position,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateColumnPositions(columns: Column[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const column of columns) {
        await queryRunner.manager.update(Column, column.id, {
          position: column.position
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCardPosition(cardId: string, newPosition: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const card = await queryRunner.manager.findOne(Card, {
        where: { id: cardId },
      });

      if (!card) {
        throw new NotFoundException(`Card with ID ${cardId} not found`);
      }

      await queryRunner.manager.update(Card, cardId, {
        position: newPosition,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
