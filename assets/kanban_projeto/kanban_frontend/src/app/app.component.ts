import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BoardComponent } from './components/board/board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    BoardComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Kanban Board</span>
    </mat-toolbar>
    <app-board></app-board>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    
    mat-toolbar {
      margin-bottom: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'kanban-frontend';
}
