import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Factura } from '../../../../../models/factura.model';

interface DetalleFacturaAPI {
  success: boolean;
  data: {
    id: string;
    document: { id: number };
    number: number;
    name: string;
    date: string;
    cost_center: number;
    supplier: {
      id: string;
      identification: string;
      branch_office: number;
    };
    total: number;
    balance: number;
    provider_invoice: {
      prefix: string;
      number: string;
    };
    discount_type: string;
    items: Array<{
      id: string;
      type: string;
      code: string;
      quantity: number;
      price: number;
      discount: number;
      description: string;
      total: number;
      taxes: Array<{
        id: number;
        name: string;
        type: string;
        percentage: number;
        value: number;
      }>;
    }>;
    retentions: any[];
    payments: Array<{
      id: number;
      name: string;
      value: number;
    }>;
    metadata: {
      created: string;
    };
  };
}

@Component({
  selector: 'app-detalle-factura-dialog',
  templateUrl: './detalle-factura-dialog.component.html',
  styleUrls: ['./detalle-factura-dialog.component.css']
})
export class DetalleFacturaDialogComponent {
  factura: Factura;
  detalleAPI: DetalleFacturaAPI['data'] | null = null;

  constructor(
    public dialogRef: MatDialogRef<DetalleFacturaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { factura: Factura; detalleAPI?: DetalleFacturaAPI['data'] }
  ) {
    this.factura = data.factura;
    this.detalleAPI = data.detalleAPI || null;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  get totalImpuestos(): number {
    if (!this.detalleAPI) return this.factura.impuestos || 0;
    
    return this.detalleAPI.items.reduce((total, item) => {
      return total + item.taxes.reduce((taxTotal, tax) => taxTotal + tax.value, 0);
    }, 0);
  }

  get subtotalCalculado(): number {
    if (!this.detalleAPI) return this.factura.subtotal || 0;
    
    return this.detalleAPI.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
} 