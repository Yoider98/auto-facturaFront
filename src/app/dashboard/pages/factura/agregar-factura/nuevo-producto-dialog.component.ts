import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-producto-dialog',
  templateUrl: './nuevo-producto-dialog.component.html'
})
export class NuevoProductoDialogComponent {
  productoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NuevoProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      descripcion: ['', Validators.required],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
      nombreIva:  ['', Validators.required],
      iva: [0, [Validators.required, Validators.min(0)]],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  guardar() {
    if (this.productoForm.valid) {
      this.dialogRef.close(this.productoForm.value);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
} 