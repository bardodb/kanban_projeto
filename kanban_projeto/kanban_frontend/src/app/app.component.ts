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
    <div class="app-container">
      <mat-toolbar>
        <span class="title">Kanban Board</span>
      </mat-toolbar>
      <app-board></app-board>
    </div>
  `,
  styles: [`
    .app-container {
      display: block;
      height: 100vh;
      background-color: #1D2125;
    }
    
    mat-toolbar {
      background-color: #1D2125;
      color: #B6C2CF;
      height: 64px;
      padding: 0 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  `]
})
export class AppComponent {
  title = 'kanban-frontend';
}
