import { Entity, PrimaryGeneratedColumn, Column as TypeOrmColumn, OneToMany } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  title: string;

  @TypeOrmColumn({ type: 'integer', default: 0 })
  position: number;

  @OneToMany(() => Card, card => card.column, {
    cascade: true
  })
  cards: Card[];
}
