import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { KanbanService } from './kanban.service';
import { Board } from './models/board.model';
import { Column } from './models/column.model';
import { Card } from './models/card.model';
import { CreateColumnInput } from './inputs/create-column.input';
import { CreateCardInput } from './inputs/create-card.input';
import { UpdateCardInput } from './inputs/update-card.input';
import { MoveCardInput } from './inputs/move-card.input';
import { UpdateColumnPositionsInput } from './inputs/update-column-positions.input';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Resolver()
export class KanbanResolver {
  constructor(private readonly kanbanService: KanbanService) {}

  @Query(() => Board)
  async getBoard(): Promise<Board> {
    const columns = await this.kanbanService.findAllColumns();
    return { columns };
  }

  @Mutation(() => Column)
  async createColumn(
    @Args('input') createColumnInput: CreateColumnInput,
  ): Promise<Column> {
    return this.kanbanService.createColumn(createColumnInput);
  }

  @Mutation(() => Boolean)
  async deleteColumn(
    @Args('columnId') columnId: string,
  ): Promise<boolean> {
    await this.kanbanService.deleteColumn(columnId);
    return true;
  }

  @Mutation(() => Boolean)
  async updateColumnPositions(
    @Args('input') input: UpdateColumnPositionsInput,
  ): Promise<boolean> {
    try {
      console.log('Received input for updateColumnPositions:', JSON.stringify(input, null, 2));
      
      // More detailed input validation
      if (!input) {
        console.error('Input is null or undefined');
        throw new Error('Input is required');
      }
      
      // Check if input has the columns property
      if (!input.columns) {
        console.error('Input columns is missing:', input);
        throw new Error('Input columns is required');
      }
      
      // Check if columns is an array
      if (!Array.isArray(input.columns)) {
        console.error('Input columns is not an array:', typeof input.columns);
        throw new Error('Invalid input: columns must be an array');
      }
      
      // Log each column for debugging
      input.columns.forEach((col, index) => {
        console.log(`Column ${index}:`, JSON.stringify(col));
      });
      
      if (input.columns.length === 0) {
        console.log('Empty columns array received, nothing to update');
        return true;
      }
      
      // Validate each column in the array
      input.columns.forEach((col, index) => {
        if (!col || typeof col !== 'object') {
          throw new Error(`Invalid column at index ${index}: column must be an object`);
        }
        
        if (!col.id) {
          throw new Error(`Invalid column at index ${index}: id is required`);
        }
        
        if (typeof col.position !== 'number') {
          throw new Error(`Invalid column at index ${index}: position must be a number`);
        }
      });
      
      await this.kanbanService.updateColumnPositions(input.columns);
      console.log('Column positions updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating column positions:', error);
      throw error;
    }
  }

  @Mutation(() => Column)
  async updateColumn(
    @Args('id') id: string,
    @Args('title') title: string
  ): Promise<Column> {
    console.log(`Updating column ${id} with title: ${title}`);
    return this.kanbanService.updateColumnTitle(id, title);
  }

  @Mutation(() => Card)
  async createCard(
    @Args('input') input: CreateCardInput,
  ): Promise<Card> {
    return this.kanbanService.createCard(input.columnId, {
      title: input.title,
      description: input.description,
    });
  }

  @Mutation(() => Boolean)
  async deleteCard(
    @Args('cardId') cardId: string,
  ): Promise<boolean> {
    await this.kanbanService.deleteCard(cardId);
    return true;
  }

  @Mutation(() => Boolean)
  async moveCard(
    @Args('input') input: MoveCardInput,
  ): Promise<boolean> {
    const moveCardDto: MoveCardDto = {
      fromColumnId: input.fromColumnId,
      toColumnId: input.toColumnId,
      position: input.position,
    };
    await this.kanbanService.moveCard(input.cardId, moveCardDto);
    return true;
  }

  @Mutation(() => Card)
  async updateCard(
    @Args('input') input: UpdateCardInput,
  ): Promise<Card> {
    const updateCardDto: UpdateCardDto = {
      title: input.title,
      description: input.description,
      color: input.color,
    };
    return this.kanbanService.updateCard(input.id, updateCardDto);
  }
}
