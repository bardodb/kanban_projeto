import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-column-dialog',
  templateUrl: './add-column-dialog.component.html',
  styleUrls: ['./add-column-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class AddColumnDialogComponent {
  columnForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddColumnDialogComponent>,
    private fb: FormBuilder
  ) {
    this.columnForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.columnForm.valid) {
      this.dialogRef.close(this.columnForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
