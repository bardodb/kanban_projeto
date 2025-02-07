import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Card } from '../../models/kanban.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  template: `
    <mat-card class="card">
      <mat-card-header>
        <mat-card-title>{{ card.title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>{{ card.description }}</p>
        <small>{{ card.createdAt | date:'short' }}</small>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() card!: Card;
}
