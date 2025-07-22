import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacturaService } from '../../../../services/factura.service';
import { Factura, ItemProducto } from '../../../../models/factura.model';
import { ProveedorDialogComponent } from './proveedor-dialog/proveedor-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { NuevoProductoDialogComponent } from './nuevo-producto-dialog.component';

@Component({
  selector: 'app-agregar-factura',
  templateUrl: './agregar-factura.component.html',
  styleUrls: ['./agregar-factura.component.css']
})
export class AgregarFacturaComponent implements OnInit {
  facturaForm: FormGroup;
  loading = false;
  isLoading = false;
  showAddProveedorModal = false;
  divisas = ['COP'];
  tiposProducto = [
    {value: 'FixedAsset', label: 'Activo Fijo'},
    {value: 'Account', label: 'Cuenta Contable'}
  ];

  centroCostos: any[] = [];
  metodoPago: any[] = [];
  cuentacontable: any[] = [];
  tiposFactura: any[] = [];
  proveedor: any = {};
  filteredCuentas: Observable<any[]>[] = [];
  activosFijosOptions: any[] = [];
  filteredActivosFijos: Observable<any[]>[] = [];
  impuestosDisponibles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AgregarFacturaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.facturaForm = this.createForm();
  }

  ngOnInit() {
    console.log("Data: ", this.data);
    if (this.data) {
      this.loadFacturaData(this.data);
      console.log("emisor -> ",this.data.idEmisor )
      this.loadProveedor(this.data.idEmisor);
    } else {
      this.proveedor = {};
    }

    this.centroCostos = JSON.parse(localStorage.getItem('centroCostos') || '[]');
    this.metodoPago = JSON.parse(localStorage.getItem('metodoPago') || '[]');
    this.tiposFactura = JSON.parse(localStorage.getItem('typeFacturaCompra') || '[]');
    this.cuentacontable = JSON.parse(localStorage.getItem('cuentaContable') || '[]');
    

    console.log("CentroCostos: ", this.centroCostos);
    console.log("MetodoPago: ", this.metodoPago);
    console.log("TiposFactura: ", this.tiposFactura);
    console.log("CuentaContable: ", this.cuentacontable);
    console.log("Número de cuentas contables cargadas: ", this.cuentacontable.length);

    // Inicializar los observables de autocompletar para cada item
    this.initializeAutocompleteObservables();

    const activosFijos = localStorage.getItem('activosFijosOptions');
    this.activosFijosOptions = activosFijos ? JSON.parse(activosFijos) : [];

    // Cargar impuestos
    this.http.get<any[]>('assets/codeDane/impuesto.json').subscribe(data => {
      this.impuestosDisponibles = data;
    });
  }

  // Método para inicializar los observables de autocompletar
  initializeAutocompleteObservables() {
    this.filteredCuentas = [];
    this.filteredActivosFijos = [];
    if (this.itemsProductos && this.itemsProductos.controls.length > 0) {
      this.itemsProductos.controls.forEach((control, index) => {
        const cuentaControl = control.get('cuentaContable');
        if (cuentaControl) {
          this.filteredCuentas[index] = this.getFilteredCuentas(cuentaControl);
        }
        const activoFijoControl = control.get('activoFijo');
        if (activoFijoControl) {
          this.filteredActivosFijos[index] = this.getFilteredActivosFijos(activoFijoControl);
        }
      });
    }
  }

  // Método para filtrar cuentas
  filterCuentas(value: string): any[] {
    const filterValue = value ? value.toLowerCase() : '';
    const filtered = this.cuentacontable.filter(option => 
      option.label.toLowerCase().includes(filterValue) || 
      option.value.toLowerCase().includes(filterValue)
    );
    return filtered;
  }

  // Método para obtener el Observable de cuentas filtradas
  getFilteredCuentas(control: any): Observable<any[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map((value: string) => this.filterCuentas(value || ''))
    );
  }

  // Método para obtener el observable de autocompletar para un índice específico
  getFilteredCuentasByIndex(index: number): Observable<any[]> {
    if (!this.filteredCuentas[index]) {
      const control = this.itemsProductos.at(index).get('cuentaContable');
      if (control) {
        this.filteredCuentas[index] = this.getFilteredCuentas(control);
      } else {
        return new Observable(observer => observer.next([]));
      }
    }
    
    return this.filteredCuentas[index];
  }

  // Método para mostrar la opción seleccionada en el input
  displayFn = (cuenta: any): string => {
    if (!cuenta) return '';
    if (typeof cuenta === 'string') return cuenta;
    return `${cuenta.value} - ${cuenta.label}`;
  }

  createForm(): FormGroup {
    return this.fb.group({
      numero: ['', [Validators.required]],
      uuid: [''],
      fechaEmision: ['', [Validators.required]],
      fechaVencimiento: [''],
      fechaRecepcion: [''],
      tipoDocumento: ['', [Validators.required]],
      divisa: ['COP', [Validators.required]],
      idEmisor: ['', [Validators.required]],
      idReceptor: ['', [Validators.required]],
      formaPago: ['Contado', [Validators.required]], 
      medioPago: ['Transferencia', [Validators.required]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      descuento: [0, [Validators.required, Validators.min(0)]],
      impuestos: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      itemsProductos: this.fb.array([this.createItemProducto()])
    });
  }

  createItemProducto(): FormGroup {
    return this.fb.group({
      tipoProducto: ['FixedAsset'],
      cuentaContable: [''],
      activoFijo: [''],
      descripcion: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      descuento: ['0.00'],
      impuesto: this.fb.group({
        nombre: ['IVA'],
        porcentaje: ['0.00'],
        base: ['0.00'],
        valor: ['0.00']
      }),
      precioUnit: this.fb.group({
        valor: ['0.00'],
        base: ['0.00']
      }),
      subtotal: ['0.00'],
      total: ['0.00']
    });
  }

  initItemProducto(item: ItemProducto | null = null): FormGroup {
    return this.fb.group({
      tipoProducto: [item.tipoProducto || 'Account'],
      cuentaContable: [item.cuentaContable || ''],
      activoFijo: [item.activoFijo || ''],
      descripcion: [item.descripcion || '', Validators.required],
      cantidad: [item.cantidad || 0, [Validators.required, Validators.min(0)]],
      descuento: [item.descuento || 0],
      impuesto: this.fb.group({
        nombre: [item.impuesto.nombre || 'IVA'],
        porcentaje: [item.impuesto.porcentaje ? parseFloat(item.impuesto.porcentaje) : 0],
        base: [item.impuesto.base ? parseFloat(item.impuesto.base) : 0],
        valor: [item.impuesto.valor ? parseFloat(item.impuesto.valor) : 0]
      }),
      precioUnit: this.fb.group({
        valor: [item.precioUnit.valor ? parseFloat(item.precioUnit.valor) : 0],
        base: [item.precioUnit.base ? parseFloat(item.precioUnit.base) : 0]
      }),
      subtotal: [item.subtotal ? parseFloat(item.subtotal) : 0],
      total: [item.total ? parseFloat(item.total) : 0]
    });
  }
  

  get itemsProductos(): FormArray {
    return this.facturaForm.get('itemsProductos') as FormArray;
  }

  // Método para obtener el índice del item actual
  getControlItemIndex(control: any): number {
    return this.itemsProductos.controls.findIndex(item => item === control);
  }

  // Agregar un nuevo ítem de producto
  addItemProducto(): void {
    const dialogRef = this.dialog.open(NuevoProductoDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const cantidad = Number(result.cantidad);
        const valorUnitario = Number(result.valorUnitario);
        const descuento = 0;
        const iva = Number(result.iva);

        const subtotal = cantidad * valorUnitario - descuento;
        const valorIva = subtotal * (iva / 100);
        const total = subtotal + valorIva;

        const item = {
          descripcion: result.descripcion,
          cantidad: cantidad.toString(),
          descuento: descuento.toString(),
          impuesto: {
            nombre: result.nombreIva.toString(),
            porcentaje: iva.toString(),
            base: subtotal.toString(),
            valor: valorIva.toString(),
          },
          precioUnit: {
            valor: valorUnitario.toString(),
            base: cantidad.toString()
          },
          subtotal: subtotal.toString(),
          total: total.toString(),
          tipoProducto: 'Account',
          cuentaContable: ''
        };
        this.itemsProductos.push(this.initItemProducto(item));
        this.calcularTotal();
        const newIndex = this.itemsProductos.length - 1;
        const control = this.itemsProductos.at(newIndex).get('cuentaContable');
        this.filteredCuentas[newIndex] = this.getFilteredCuentas(control);
      }
    });
  }

  // Eliminar un ítem de producto
  removeItemProducto(index: number): void {
    this.itemsProductos.removeAt(index);
    this.calcularTotal();
    
    // Remover el observable del item eliminado y reindexar
    this.filteredCuentas.splice(index, 1);
  }

  // Función para redondear a 2 decimales de forma exacta
  round2(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  // Calcular subtotal de un ítem
  calcularSubtotal(index: number): void {
    const item = this.itemsProductos.at(index);
    const cantidad = parseFloat(item.get('cantidad').value) || 0;
    const precioUnit = item.get('precioUnit').value;
    const precioUnitario = parseFloat(precioUnit.valor) || 0;
    const descuento = parseFloat(item.get('descuento').value) || 0;

    // Calcular subtotal sin descuento
    const subtotalSinDescuento = cantidad * precioUnitario;

    // Aplicar descuento
    const subtotalConDescuento = subtotalSinDescuento - descuento;

    // Asegurar que el subtotal no sea negativo
    const subtotalFinal = Math.max(0, subtotalConDescuento);

    // Calcular IVA
    const impuestoGroup = item.get('impuesto');
    const porcentajeIva = parseFloat(impuestoGroup.get('porcentaje').value) || 0;
    const valorIva = subtotalFinal * (porcentajeIva / 100);

    // Calcular total
    const totalFinal = subtotalFinal + valorIva;

    // Actualizar los valores en el formulario reactivo
    item.get('subtotal').setValue(subtotalFinal, { emitEvent: false });
    impuestoGroup.patchValue({
      base: subtotalFinal,
      valor: valorIva
    }, { emitEvent: false });
    item.get('total').setValue(totalFinal, { emitEvent: false });

    this.calcularTotal();
  }

  // Calcular total de la factura
  calcularTotal(): void {
    let subtotalGlobal = 0;
    let totalImpuestos = 0;
    let totalDescuentos = 0;
    let subtotalAntesDescuentos = 0;
    let totalFinal = 0;
  
    // Calcular totales
    this.itemsProductos.controls.forEach(item => {
      const cantidad = parseFloat(item.get('cantidad').value || 0);
      const precioUnit = parseFloat(item.get('precioUnit').get('valor').value || 0);
      const descuento = parseFloat(item.get('descuento').value || 0);
      const subtotal = parseFloat(item.get('subtotal').value || 0);
      const impuesto = item.get('impuesto').value;
      const valorImpuesto = parseFloat(impuesto.valor || 0);

      totalImpuestos += valorImpuesto;
      subtotalAntesDescuentos += (cantidad * precioUnit);
      subtotalGlobal += subtotal;
      totalDescuentos += descuento;
    });
    
    // Calcular el total final
    totalFinal = subtotalGlobal + totalImpuestos;
    
    // Verificar si hay decimales en el total
    const totalRedondeado = Math.round(totalFinal);
    const diferencia = totalRedondeado - totalFinal;
    
    // Si hay diferencia y no hay un ajuste de peso existente, agregarlo
    if (diferencia !== 0 && !this.itemsProductos.controls.some(item => 
      item.get('descripcion').value === 'Ajuste de peso')) {
      
      const itemAjuste = {
        descripcion: 'Ajuste de peso',
        cantidad: 1,
        descuento: 0,
        impuesto: {
          nombre: 'IVA',
          porcentaje: '0',
          base: diferencia,
          valor: 0
        },
        precioUnit: {
          valor: diferencia,
          base: '1'
        },
        subtotal: diferencia,
        total: diferencia,
        tipoProducto: 'Account',
        cuentaContable: '42958101'
      };
      
      this.itemsProductos.push(this.initItemProducto(itemAjuste as any));
      
      // Actualizar el índice del autocompletado para la nueva línea
      const newIndex = this.itemsProductos.length - 1;
      const control = this.itemsProductos.at(newIndex).get('cuentaContable');
      this.filteredCuentas[newIndex] = this.getFilteredCuentas(control);
      
      // Recalcular totales con el ajuste
      return this.calcularTotal();
    }
    
    // Solo redondea para mostrar, no para operar
    this.facturaForm.get('subtotal').setValue(this.round2(subtotalGlobal));
    this.facturaForm.get('descuento').setValue(this.round2(totalDescuentos));
    this.facturaForm.get('impuestos').setValue(this.round2(totalImpuestos));
    this.facturaForm.get('total').setValue(this.round2(totalFinal));
  }

  // Método para obtener el subtotal antes de descuentos
  getSubtotalAntesDescuentos(): number {
    let subtotalAntesDescuentos = 0;
    
    this.itemsProductos.controls.forEach(item => {
      const cantidad = parseFloat(item.get('cantidad').value || 0);
      const precioUnit = parseFloat(item.get('precioUnit').get('valor').value || 0);
      subtotalAntesDescuentos += cantidad * precioUnit;
    });
    
    return subtotalAntesDescuentos;
  }

  // Formatear impuesto para mostrar en el template
  formatearImpuesto(impuesto: any): string {
    if (!impuesto || isNaN(parseFloat(impuesto.porcentaje))) return '';
    
    let porcentaje = parseFloat(impuesto.porcentaje);
  
    if (porcentaje > 0 && porcentaje < 1) {
      porcentaje = porcentaje * 100;
    }
  
    return `${impuesto.nombre} (${porcentaje.toFixed(2)}%)`;
  }
  
  

  calcularImpuestos(): number {
    let totalImpuestos = 0;
    this.itemsProductos.controls.forEach(item => {
      const impuesto = item.get('impuesto').value;
      if (impuesto && impuesto.porcentaje) {
        const subtotal = parseFloat(item.get('subtotal').value);
        const valorImpuesto = subtotal * (parseFloat(impuesto.porcentaje) / 100);
        totalImpuestos += valorImpuesto;
        
        // Update the tax value in the form to match example structure
        item.get('impuesto').patchValue({
          base: subtotal.toFixed(2),
          valor: valorImpuesto.toFixed(2)
        });
      }
    });
    return totalImpuestos;
  }

  loadFacturaData(factura: any) {
    // First load basic data that doesn't depend on proveedor
    this.facturaForm.patchValue({
      ...factura,
      fechaEmision: this.formatDateToInput(factura.fecha),
      fechaVencimiento: this.formatDateToInput(factura.fechaVencimiento),
      fechaRecepcion: this.formatDateToInput(factura.fechaRecepcion)
    });
    
    // Set idEmisor after proveedor is loaded (handled in loadProveedor)
    
    // Load product items
    if (factura.productos && factura.productos.length > 0) {
      const itemsArray = this.facturaForm.get('itemsProductos') as FormArray;
      itemsArray.clear();
      let totalFactura = 0;
      let subtotalFactura = 0;
      let totalImpuestos = 0;
      let totalDescuentos = 0;
      factura.productos.forEach(item => {
        // Depuración: mostrar el producto original
        //console.log('Producto original:', item);
        // Aplicar la fórmula de cálculo por ítem
        const cantidad = parseFloat(item.cantidad) || 0;
        const valorUnitario = parseFloat(item.precioUnit && item.precioUnit.valor ? item.precioUnit.valor : 0) || 0;
        const descuento = parseFloat(item.descuento) || 0;
        const porcentajeIVA = parseFloat(item.impuesto && item.impuesto.porcentaje ? item.impuesto.porcentaje : 0) || 0;
        // Valor base
        const valorBase = this.round2(cantidad * valorUnitario - descuento);
        // IVA
        const valorIVA = this.round2((valorBase * porcentajeIVA) / 100);
        // Total por ítem
        const totalItem = this.round2(valorBase + valorIVA);
        // Depuración: mostrar los cálculos
       // console.log(`Cálculos para ${item.descripcion}: cantidad=${cantidad}, valorUnitario=${valorUnitario}, descuento=${descuento}, porcentajeIVA=${porcentajeIVA}, valorBase=${valorBase}, valorIVA=${valorIVA}, totalItem=${totalItem}`);
        // Actualizar los valores en el item
        item.subtotal = valorBase;
        if (item.impuesto) {
          item.impuesto.base = valorBase;
          item.impuesto.valor = valorIVA;
        }
        item.total = totalItem;
        subtotalFactura += valorBase;
        totalImpuestos += valorIVA;
        totalDescuentos += descuento;
        totalFactura += totalItem;
        itemsArray.push(this.initItemProducto(item));
      });
      // Inicializar los observables después de cargar los items
      this.initializeAutocompleteObservables();
      // Verificar si hay decimales en el total
      const totalRedondeado = Math.ceil(totalFactura); // Redondear SIEMPRE hacia arriba
      const diferencia = this.round2(totalRedondeado - totalFactura);
      // Si hay diferencia positiva y no hay un ajuste de peso existente, agregarlo
      if (diferencia > 0 && !this.itemsProductos.controls.some(item => 
        item.get('descripcion').value === 'Ajuste de peso')) {
        const itemAjuste = {
          descripcion: 'Ajuste de peso',
          cantidad: 1,
          descuento: 0,
          impuesto: {
            nombre: 'IVA',
            porcentaje: '0',
            base: diferencia,
            valor: 0
          },
          precioUnit: {
            valor: diferencia,
            base: '1'
          },
          subtotal: diferencia,
          total: diferencia,
          tipoProducto: 'Account',
          cuentaContable: '42958101'
        };
        this.itemsProductos.push(this.initItemProducto(itemAjuste as any));
        // Actualizar el índice del autocompletado para la nueva línea
        const newIndex = this.itemsProductos.length - 1;
        const control = this.itemsProductos.at(newIndex).get('cuentaContable');
        this.filteredCuentas[newIndex] = this.getFilteredCuentas(control);
      }
      // Actualizar los totales en el formulario
      this.facturaForm.get('subtotal').setValue(this.round2(subtotalFactura));
      this.facturaForm.get('descuento').setValue(this.round2(totalDescuentos));
      this.facturaForm.get('impuestos').setValue(this.round2(totalImpuestos));
      this.facturaForm.get('total').setValue(this.round2(totalFactura + (diferencia > 0 ? diferencia : 0)));
    }
  }

  getPorcentajeImpuesto(): string {
    const primerItem = this.itemsProductos.at(0);
    if (!primerItem) return '';
    const impuesto = primerItem.get('impuesto').value;
    const porcentaje = parseFloat(impuesto.porcentaje || '0');
    return porcentaje.toString(); // exacto, sin redondear ni multiplicar por 100
  }
  

  loadProveedor(idEmisor:string) {
    this.isLoading = true;
    this.facturaService.getProveedor(idEmisor).subscribe({
      next: (proveedor) => {
        console.log("Proveedor: ", proveedor);
        this.proveedor = proveedor;
        this.isLoading = false;
        this.showAddProveedorModal = false; 
      },
      error: () => {
        this.isLoading = false;
        this.showAddProveedorModal = true; 
      }
    });
  }

  openAddProveedorDialog(event?: Event) {
    // Prevenir la propagación del evento si existe
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const dialogRef = this.dialog.open(ProveedorDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: false,
      data: {},
      panelClass: 'proveedor-dialog'
    });
    console.log("lo que devuelve -> ",dialogRef )
  
   dialogRef.afterClosed().subscribe(result => {
      // Restaurar el diálogo principal
      this.dialogRef.disableClose = false;
     
      if (result) {
        console.log('Proveedor creado:', result);
        this.isLoading = true;
        this.facturaService.guardarProveedor(result)
          .subscribe({
            next: (proveedorGuardado) => {
              this.proveedor = proveedorGuardado;
              this.loadProveedor(proveedorGuardado.identification)
              this.snackBar.open('Proveedor guardado exitosamente', 'Cerrar', { duration: 3000 });
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error al guardar proveedor:', err);
              this.snackBar.open('Error al guardar proveedor', 'Cerrar', { duration: 3000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    // Verificar si se está abriendo el diálogo de proveedor
    if (this.showAddProveedorModal) {
      console.log('Prevenido submit mientras se muestra modal de proveedor');
      return;
    }
    
    if (this.facturaForm.invalid) {
      this.markFormGroupTouched(this.facturaForm);
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.impuestosDisponibles.length === 0) {
      this.snackBar.open('Los impuestos aún no se han cargado. Por favor, espera un momento.', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    this.loading = true;
    const facturaData = this.prepareFacturaData();
    console.log("facturaData", facturaData);
    

    const request = this.facturaService.createFactura(facturaData);

    request.subscribe({
      next: (response) => {
        console.log("response -> ", response)
        this.snackBar.open(
          `Factura actualizada correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al guardar la factura:', error);
        this.snackBar.open(
          `Error al actualizar la factura`,
          'Cerrar',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

  private prepareFacturaData(): any {
    const formValue = this.facturaForm.value;

    const productos = formValue.itemsProductos.map(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const valorUnitario = parseFloat(item.precioUnit.valor) || 0;
      const descuento = parseFloat(item.descuento) || 0;
      const porcentajeIVA = parseFloat(item.impuesto.porcentaje || 0);

      const valorBase = this.round2(cantidad * valorUnitario - descuento);
      const valorIVA = this.round2((valorBase * porcentajeIVA) / 100);
      const totalItem = this.round2(valorBase + valorIVA);

      // Si es 0% de IVA o ajuste de peso, limpiar campos
      if (porcentajeIVA === 0 || item.descripcion.toLowerCase().includes('ajuste de peso')) {
        item.impuesto = {
          tipo: '', nombre: '', porcentaje: 0, base: 0, valor: 0, id: null, type: null
        };
      } else {
        const impuestoSeleccionado = this.impuestosDisponibles.find(imp =>
          imp.name.toLowerCase().includes(item.impuesto.nombre.toLowerCase()) &&
          Number(imp.percentage) === Number(porcentajeIVA)
        );
        if (impuestoSeleccionado) {
          item.impuesto.id = impuestoSeleccionado.id;
          item.impuesto.type = impuestoSeleccionado.type;
        }
        item.impuesto.base = valorBase;
        item.impuesto.valor = valorIVA;
      }

      item.subtotal = valorBase;
      item.total = totalItem;
      return item;
    });

    // Calcular totales como Siigo: redondeo por ítem
    let subtotal = 0;
    let impuestos = 0;

    productos.forEach(item => {
      subtotal += this.round2(item.subtotal);
      impuestos += this.round2(item.impuesto.valor || 0);
    });

    subtotal = this.round2(subtotal);
    impuestos = this.round2(impuestos);
    const total = this.round2(subtotal + impuestos);

    return {
      ...formValue,
      itemsProductos: productos,
      subtotal,
      impuestos,
      total,
      tax_included: false,
      payments: [
        {
          id: formValue.formaPago,
          value: total,
          due_date: formValue.fechaVencimiento
            ? new Date(formValue.fechaVencimiento).toISOString().split('T')[0]
            : null
        }
      ],
      fechaEmision: formValue.fechaEmision ? new Date(formValue.fechaEmision).toISOString() : null,
      fechaVencimiento: formValue.fechaVencimiento ? new Date(formValue.fechaVencimiento).toISOString() : null,
      fechaRecepcion: formValue.fechaRecepcion ? new Date(formValue.fechaRecepcion).toISOString() : null
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  getFilteredActivosFijos(control: any): Observable<any[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map((value: string) => this.filterActivosFijos(value || ''))
    );
  }

  filterActivosFijos(value: string): any[] {
    const filterValue = value ? value.toLowerCase() : '';
    return this.activosFijosOptions.filter(option =>
      option.label.toLowerCase().includes(filterValue) ||
      option.value.toString().includes(filterValue)
    );
  }

  getFilteredActivosFijosByIndex(index: number): Observable<any[]> {
    if (!this.filteredActivosFijos[index]) {
      const control = this.itemsProductos.at(index).get('activoFijo');
      if (control) {
        this.filteredActivosFijos[index] = this.getFilteredActivosFijos(control);
      } else {
        return new Observable(observer => observer.next([]));
      }
    }
    return this.filteredActivosFijos[index];
  }

  private formatDateToInput(dateString: string): Date | null {
    if (!dateString) return null;
    // Si ya está en formato yyyy-MM-dd, crea un Date local
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day); // Date local, sin desfase
    }
    // Si viene con hora, crea el Date normal
    return new Date(dateString);
  }
}
