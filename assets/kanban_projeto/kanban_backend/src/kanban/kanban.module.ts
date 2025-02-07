import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Card])],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}
