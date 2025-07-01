import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FacturaService } from '../../../../services/factura.service';
import { Factura } from '../../../../models/factura.model';
import { DetalleFacturaDialogComponent } from './detalle-factura-dialog/detalle-factura-dialog.component';

interface DetalleFacturaResponse {
  success: boolean;
  data: any;
}

@Component({
  selector: 'app-facturas-generadas',
  templateUrl: './facturas-generadas.component.html',
  styleUrls: ['./facturas-generadas.component.css']
})
export class FacturasGeneradasComponent implements OnInit, AfterViewInit  {
  displayedColumns: string[] = [
    'numero', 
    'fechaEmision', 
    'emisor',
    'receptor',
    'total',
    'acciones'
  ];
  dataSource: MatTableDataSource<Factura> = new MatTableDataSource<Factura>([]);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  loading: boolean = false;

  constructor(
    private facturaService: FacturaService,
    public dialog: MatDialog
  ) { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loading = true;
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.loading = true;
    this.facturaService.getFacturas().subscribe({
      next: (facturas) => {
        const filtradas = (facturas || []).filter(f => f.generated === true);
        // Ordenar por fecha
        const sortedFacturas = filtradas.sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });
        this.dataSource = new MatTableDataSource(sortedFacturas);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        console.log("facturas generadas -> ",sortedFacturas )
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalleFactura(factura: Factura): void {
    this.loading = true;
    this.facturaService.getFactura(factura.idSigo).subscribe({
      next: (detalle: any) => {
        console.log("detalle de factura -> ", detalle);
        this.loading = false;
        const dialogRef = this.dialog.open(DetalleFacturaDialogComponent, {
          width: '800px',
          data: {
            factura: factura,
            detalleAPI: detalle.data
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener detalle de factura:', error);
        this.loading = false;
      }
    });
  }
} 