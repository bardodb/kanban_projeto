import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanModule } from './kanban/kanban.module';
import { Column } from './kanban/entities/column.entity';
import { Card } from './kanban/entities/card.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.db',
      entities: [Column, Card],
      synchronize: true,
    }),
    KanbanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
