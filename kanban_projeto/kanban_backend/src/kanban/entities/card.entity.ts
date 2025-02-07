import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Column as KanbanColumn } from './column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: false })
  columnId: string;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ nullable: true })
  color: string;

  @ManyToOne(() => KanbanColumn, column => column.cards, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'columnId' })
  column: KanbanColumn;
}
