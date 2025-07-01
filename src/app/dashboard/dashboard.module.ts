import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material Modules - Imported individually from their specific paths
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Componentes
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { SubirArchivoComponent } from './pages/subirArchivo/subirArchivo.component';
import { ListaFacturasComponent } from './pages/factura/lista-facturas/lista-facturas.component';
import { AgregarFacturaComponent } from './pages/factura/agregar-factura/agregar-factura.component';
import { ProveedorDialogComponent } from './pages/factura/agregar-factura/proveedor-dialog/proveedor-dialog.component';
import { FacturasGeneradasComponent } from './pages/factura/facturas-generadas/facturas-generadas.component';
import { DetalleFacturaDialogComponent } from './pages/factura/facturas-generadas/detalle-factura-dialog/detalle-factura-dialog.component';
import { NuevoProductoDialogComponent } from './pages/factura/agregar-factura/nuevo-producto-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent, 
    SubirArchivoComponent, 
    ListaFacturasComponent, 
    AgregarFacturaComponent, ProveedorDialogComponent, FacturasGeneradasComponent, DetalleFacturaDialogComponent,
    NuevoProductoDialogComponent
  ],
  entryComponents: [
    AgregarFacturaComponent,
    ProveedorDialogComponent,
    DetalleFacturaDialogComponent,
    NuevoProductoDialogComponent
  ],
  imports: [
    // Angular modules
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    // Material modules
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatCheckboxModule
  ],
  exports: [
    // Re-export all modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatCheckboxModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ]
})
export class DashboardModule { }
