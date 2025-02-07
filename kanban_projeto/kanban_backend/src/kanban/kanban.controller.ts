import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get('board')
  async getBoard() {
    const columns = await this.kanbanService.findAllColumns();
    return { columns };
  }

  @Post('columns')
  async createColumn(@Body() createColumnDto: CreateColumnDto): Promise<Column> {
    return this.kanbanService.createColumn(createColumnDto);
  }

  @Delete('columns/:columnId')
  async deleteColumn(@Param('columnId') columnId: string): Promise<void> {
    return this.kanbanService.deleteColumn(columnId);
  }

  @Put('columns/positions')
  async updateColumnPositions(@Body() data: { columns: Column[] }): Promise<void> {
    return this.kanbanService.updateColumnPositions(data.columns);
  }

  @Post('columns/:columnId/cards')
  async createCard(
    @Param('columnId') columnId: string,
    @Body() createCardDto: CreateCardDto,
  ): Promise<Card> {
    return this.kanbanService.createCard(columnId, createCardDto);
  }

  @Delete('cards/:cardId')
  async deleteCard(@Param('cardId') cardId: string): Promise<void> {
    return this.kanbanService.deleteCard(cardId);
  }

  @Put('cards/:cardId/move')
  async moveCard(
    @Param('cardId') cardId: string,
    @Body() moveCardDto: MoveCardDto,
  ): Promise<void> {
    return this.kanbanService.moveCard(cardId, moveCardDto);
  }

  @Put('cards/:cardId/position')
  async updateCardPosition(
    @Param('cardId') cardId: string,
    @Body('position') position: number,
  ) {
    await this.kanbanService.updateCardPosition(cardId, position);
    return { success: true };
  }

  @Put('cards/:cardId')
  async updateCard(
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.kanbanService.updateCard(cardId, updateCardDto);
  }
}
