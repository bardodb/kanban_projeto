import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Card } from '../../../interfaces/card.interface';

interface DialogData {
  card: Card;
}

@Component({
  selector: 'app-edit-card-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Card</h2>
    <div id="edit-card-description" class="visually-hidden">
      Dialog for editing card details including title and description
    </div>
    <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Card Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter card title"
                 [attr.aria-label]="'Card title'"
                 [attr.aria-describedby]="'title-error'">
          <mat-error id="title-error" *ngIf="cardForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput 
                    formControlName="description" 
                    placeholder="Enter card description"
                    [attr.aria-label]="'Card description'"
                    rows="6"></textarea>
        </mat-form-field>

        <div class="color-picker" role="group" aria-label="Card color selection">
          <h3>Card Color</h3>
          <div class="color-options">
            <div *ngFor="let color of colors" 
                 [style.background-color]="color"
                 [class.selected]="cardForm.get('color')?.value === color"
                 (click)="selectColor(color)"
                 role="button"
                 [attr.aria-label]="'Select color ' + color"
                 [attr.aria-pressed]="cardForm.get('color')?.value === color">
            </div>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button type="button" 
                (click)="onCancel()"
                aria-label="Cancel editing card">Cancel</button>
        <button mat-raised-button color="primary" 
                type="submit"
                [disabled]="!cardForm.valid"
                aria-label="Save card changes">Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    .color-picker {
      margin: 1rem 0;
    }
    .color-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .color-options div {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
    }
    .color-options div.selected {
      border-color: #000;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class EditCardDialogComponent {
  cardForm: FormGroup;
  colors = [
    '#4BAE4F', // Verde mais claro
    '#2196F3', // Azul mais claro
    '#9C27B0', // Roxo mais claro
    '#E91E63', // Rosa
    '#FF9800', // Laranja
    '#607D8B'  // Azul acinzentado
  ];

  constructor(
    private dialogRef: MatDialogRef<EditCardDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.cardForm = this.fb.group({
      title: [data.card.title, Validators.required],
      description: [data.card.description],
      color: [data.card.color || this.colors[0]]
    });
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      this.dialogRef.close(this.cardForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  selectColor(color: string): void {
    this.cardForm.patchValue({ color });
  }
}
