import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanService } from './kanban.service';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { KanbanResolver } from './kanban.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Card])],
  controllers: [],
  providers: [KanbanService, KanbanResolver],
})
export class KanbanModule {}
