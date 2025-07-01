import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Factura } from '../../../../models/factura.model';
import { FacturaService } from '../../../../services/factura.service';
import { AgregarFacturaComponent } from '../agregar-factura/agregar-factura.component';

@Component({
  selector: 'app-lista-facturas',
  templateUrl: './lista-facturas.component.html',
  styleUrls: ['./lista-facturas.component.css']
})
export class ListaFacturasComponent implements OnInit, AfterViewInit  {
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

  viewReady = false;
  loading: boolean = false;

  constructor(
    private facturaService: FacturaService,
    public dialog: MatDialog,
    private router: Router
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
        // Filtrar facturas donde generate es false, null o undefined
        const filtradas = (facturas || []).filter(f =>
          f.generated === false || f.generated === null || f.generated === undefined
        );
        // Ordenar por fecha
        const sortedFacturas = filtradas.sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });
        this.dataSource = new MatTableDataSource(sortedFacturas);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        console.log("Facturas cargadas:", sortedFacturas);
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

  abrirDialogoAgregar(): void {
    this.router.navigate(['/dashboard/subirArchivo']);
  }

  editarFactura(factura: Factura): void {
    const dialogRef = this.dialog.open(AgregarFacturaComponent, {
      width: '800px',
      height: '700px',
      data: { ...factura }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarFacturas();
      }
    });
  }


}
