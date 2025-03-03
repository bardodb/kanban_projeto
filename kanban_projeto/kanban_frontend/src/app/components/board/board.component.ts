import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KanbanService } from '../../services/kanban.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddColumnDialogComponent } from '../dialogs/add-column-dialog/add-column-dialog.component';
import { AddCardDialogComponent } from '../dialogs/add-card-dialog/add-card-dialog.component';
import { EditCardDialogComponent } from '../dialogs/edit-card-dialog/edit-card-dialog.component';
import { EditColumnDialogComponent } from '../dialogs/edit-column-dialog/edit-column-dialog.component';
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
    MatMenuModule,
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

  onEditColumn(column: Column, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditColumnDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { column },
      autoFocus: true,
      restoreFocus: true,
      ariaLabel: 'Edit column',
      role: 'dialog',
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: false,
      ariaDescribedBy: 'edit-column-description'
    });

    dialogRef.afterClosed().subscribe((result?: { title: string }) => {
      if (result) {
        this.kanbanService.updateColumn(column.id, result).subscribe({
          next: (updatedColumn: Column) => {
            const columnIndex = this.board.columns.findIndex(c => c.id === column.id);
            if (columnIndex !== -1) {
              this.board.columns[columnIndex] = { ...this.board.columns[columnIndex], ...updatedColumn };
            }
          },
          error: (error: Error) => {
            console.error('Error updating column:', error);
          }
        });
      }
    });
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    try {
      // Create a deep copy of the columns array to avoid mutation issues
      const columns = JSON.parse(JSON.stringify(this.board.columns));
      
      // Validate columns before proceeding
      if (!columns || !Array.isArray(columns)) {
        console.error('Invalid board columns:', columns);
        return;
      }
      
      // Log before moving
      console.log('Before moveItemInArray:', JSON.stringify(columns));
      
      moveItemInArray(columns, event.previousIndex, event.currentIndex);
      
      // Log after moving
      console.log('After moveItemInArray:', JSON.stringify(columns));
      
      // Update positions
      columns.forEach((column: Column, index: number) => {
        if (column) {
          column.position = index;
        }
      });
      
      // Log what we're sending to the service
      console.log('Updating column positions with:', JSON.stringify(columns));
      console.log('Column count:', columns.length);
      
      // Add a small delay to ensure all logs are processed
      setTimeout(() => {
        // Call the service with the updated columns
        this.kanbanService.updateColumnPositions(columns).subscribe({
          next: (result) => {
            // Update the board with the new column order
            console.log('Column positions updated successfully:', result);
            this.board = { columns: columns };
          },
          error: (error: Error) => {
            console.error('Error updating column positions:', error);
            // Revert the change in case of error
            const revertedColumns = JSON.parse(JSON.stringify(this.board.columns));
            moveItemInArray(revertedColumns, event.currentIndex, event.previousIndex);
            this.board = { columns: revertedColumns };
          }
        });
      }, 100);
    } catch (error) {
      console.error('Error in onColumnDrop:', error);
    }
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    const cardId = event.item.data.id;
    const toColumnId = event.container.id;
    const newPosition = event.currentIndex;

    // Save original state for potential rollback
    const originalBoard = JSON.parse(JSON.stringify(this.board));

    // Sempre usar moveCard, mesmo quando na mesma coluna
    this.kanbanService.moveCard(cardId, toColumnId, newPosition).subscribe({
      next: () => {
        // The state is already updated in the service, no need to do anything here
      },
      error: (error: Error) => {
        console.error('Error moving card:', error);
        // Revert the change in case of error by restoring the original board state
        this.board = originalBoard;
      }
    });
  }

  getConnectedLists(column: any): string[] {
    return this.board.columns
      .filter((col: any) => col.id !== column.id)
      .map((col: any) => col.id);
  }
}
