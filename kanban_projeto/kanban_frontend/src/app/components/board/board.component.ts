import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KanbanService } from '../../services/kanban.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddColumnDialogComponent } from '../dialogs/add-column-dialog/add-column-dialog.component';
import { AddCardDialogComponent } from '../dialogs/add-card-dialog/add-card-dialog.component';
import { EditCardDialogComponent } from '../dialogs/edit-card-dialog/edit-card-dialog.component';
import { Column } from '../../interfaces/column.interface';
import { Card } from '../../interfaces/card.interface';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DragDropModule
  ]
})
export class BoardComponent implements OnInit {
  board: { columns: Column[] } = {
    columns: []
  };

  constructor(
    private kanbanService: KanbanService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBoard();
  }

  loadBoard(): void {
    this.kanbanService.board$.subscribe(board => {
      this.board = board;
    });
  }

  onAddColumn(): void {
    const dialogRef = this.dialog.open(AddColumnDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      autoFocus: true,
      restoreFocus: true,
      ariaLabel: 'Add new column'
    });

    dialogRef.afterClosed().subscribe((result?: { title: string }) => {
      if (result) {
        this.kanbanService.createColumn(result.title).subscribe({
          next: (column: Column) => {
            this.board.columns.push(column);
          },
          error: (error: Error) => {
            console.error('Error creating column:', error);
          }
        });
      }
    });
  }

  onAddCard(columnId: string): void {
    const dialogRef = this.dialog.open(AddCardDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { columnId },
      autoFocus: true,
      restoreFocus: true,
      ariaLabel: 'Add new card'
    });

    dialogRef.afterClosed().subscribe((result?: { title: string; description: string }) => {
      if (result) {
        const cardData = {
          title: result.title,
          description: result.description
        };
        
        this.kanbanService.createCard(columnId, cardData).subscribe({
          next: (card: Card) => {
            const column = this.board.columns.find(col => col.id === columnId);
            if (column) {
              column.cards.push(card);
            }
          },
          error: (error: Error) => {
            console.error('Error creating card:', error);
          }
        });
      }
    });
  }

  onDeleteColumn(columnId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this column?')) {
      this.kanbanService.deleteColumn(columnId).subscribe(
        () => {
          this.board.columns = this.board.columns.filter((column: any) => column.id !== columnId);
        },
        (error: Error) => {
          console.error('Error deleting column:', error);
        }
      );
    }
  }

  onDeleteCard(cardId: string, columnId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this card?')) {
      this.kanbanService.deleteCard(cardId, columnId).subscribe(
        () => {
          const column = this.board.columns.find((col: any) => col.id === columnId);
          if (column) {
            column.cards = column.cards.filter((card: any) => card.id !== cardId);
          }
        },
        (error: Error) => {
          console.error('Error deleting card:', error);
        }
      );
    }
  }

  onEditCard(card: Card, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditCardDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { card },
      autoFocus: true,
      restoreFocus: true,
      ariaLabel: 'Edit card',
      role: 'dialog',
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: false,
      ariaDescribedBy: 'edit-card-description'
    });

    dialogRef.afterClosed().subscribe((result?: { title: string; description: string; color?: string }) => {
      if (result) {
        this.kanbanService.updateCard(card.id, result).subscribe({
          next: (updatedCard: Card) => {
            const column = this.board.columns.find(col => 
              col.cards.some(c => c.id === card.id)
            );
            if (column) {
              const cardIndex = column.cards.findIndex(c => c.id === card.id);
              if (cardIndex !== -1) {
                column.cards[cardIndex] = { ...column.cards[cardIndex], ...updatedCard };
              }
            }
          },
          error: (error: Error) => {
            console.error('Error updating card:', error);
          }
        });
      }
    });
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const columns = [...this.board.columns];
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    
    // Update positions
    columns.forEach((column, index) => {
      column.position = index;
    });

    this.kanbanService.updateColumnPositions(columns).subscribe({
      next: () => {
        this.board = { ...this.board, columns };
      },
      error: (error: Error) => {
        console.error('Error updating column positions:', error);
        // Revert the change in case of error
        moveItemInArray(columns, event.currentIndex, event.previousIndex);
        this.board = { ...this.board, columns };
      }
    });
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    const cardId = event.item.data.id;
    const toColumnId = event.container.id;
    const newPosition = event.currentIndex;

    // Sempre usar moveCard, mesmo quando na mesma coluna
    this.kanbanService.moveCard(cardId, toColumnId, newPosition).subscribe({
      error: (error: Error) => {
        console.error('Error moving card:', error);
        // Revert the change in case of error
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
        } else {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        }
      }
    });
  }

  getConnectedLists(column: any): string[] {
    return this.board.columns
      .filter((col: any) => col.id !== column.id)
      .map((col: any) => col.id);
  }
}
