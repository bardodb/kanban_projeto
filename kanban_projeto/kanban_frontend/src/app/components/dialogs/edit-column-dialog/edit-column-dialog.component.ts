import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../../interfaces/column.interface';

@Component({
  selector: 'app-edit-column-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Column</h2>
    <div mat-dialog-content>
      <p id="edit-column-description">Update the column details below.</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Column Title</mat-label>
        <input matInput [(ngModel)]="title" placeholder="Enter column title" required>
        <mat-icon matSuffix>title</mat-icon>
        <mat-error *ngIf="!title">Title is required</mat-error>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!title" (click)="onSave()">
        Save Changes
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    
    h2 {
      margin-top: 0;
      color: #B6C2CF;
    }
    
    p {
      color: #8C9BAB;
      margin-bottom: 16px;
    }
  `]
})
export class EditColumnDialogComponent {
  title: string;

  constructor(
    public dialogRef: MatDialogRef<EditColumnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { column: Column }
  ) {
    this.title = data.column.title;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.title) {
      this.dialogRef.close({ title: this.title });
    }
  }
}
