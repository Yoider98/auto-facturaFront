// proveedor-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-proveedor-dialog',
  templateUrl: './proveedor-dialog.component.html',
  styleUrls: ['./proveedor-dialog.component.css']
})
export class ProveedorDialogComponent implements OnInit {
  proveedorNaturalForm: FormGroup;
  proveedorJuridicoForm: FormGroup;
  selectedForm: 'natural' | 'juridico' = 'juridico';
  departamentos: any[] = [];
  ciudades: any[] = [];
  ciudadesFiltradas: any[] = [];
  todosLugares: any[] = [];

  // Opciones para los selectores
  tiposDocumento = [
    { value: '13', viewValue: 'Cédula de ciudadanía' },
    { value: '31', viewValue: 'NIT' },
    { value: '22', viewValue: 'Cédula de extranjería' },
    { value: '42', viewValue: 'Documento de identificación extranjero' },
    { value: '50', viewValue: 'NIT de otro país' },
    { value: 'R-00-PN', viewValue: 'No obligado a registrarse en el RUT PN' },
    { value: '91', viewValue: 'NUIP' },
    { value: '41', viewValue: 'Pasaporte' },
    { value: '47', viewValue: 'Permiso especial de permanencia PEP' },
    { value: '11', viewValue: 'Registro civil' },
    { value: '43', viewValue: 'Sin identificación del exterior o para uso definido por la DIAN' },
    { value: '21', viewValue: 'Tarjeta de extranjería' },
    { value: '12', viewValue: 'Tarjeta de identidad' },
    { value: '89', viewValue: 'Salvoconducto de permanencia' },
    { value: '48', viewValue: 'Permiso protección temporal PPT' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ProveedorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Formulario para Persona Natural
    this.proveedorNaturalForm = this.fb.group({
      tipo_documento: ['cc', Validators.required],
      numero_documento: ['', [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      responsable_iva: [false],
      responsabilidad_fiscal: ['', Validators.required],
      ciudad: ['', Validators.required],
      departamento: ['', Validators.required],
      pais: ['Co', Validators.required],
      indicativo_telefono: ['57', [Validators.required, Validators.pattern(/^\d+$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      extension_telefono: [''],
      direccion: ['', Validators.required],
      email: ['', [Validators.email]]
    });

    // Formulario para Persona Jurídica
    this.proveedorJuridicoForm = this.fb.group({
      tipo_documento: ['nit', Validators.required],
      numero_documento: ['', [Validators.required, Validators.pattern(/^\d{9,10}$/)]],
      razon_social: ['', Validators.required],
      nombre_comercial: ['', Validators.required],
      sucursal: [''],
      responsable_iva: [false],
      responsabilidad_fiscal: ['', Validators.required],
      ciudad: ['', Validators.required],
      departamento: ['', Validators.required],
      pais: ['Co', Validators.required],
      indicativo_telefono: ['57', [Validators.required, Validators.pattern(/^\d+$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      extension_telefono: [''],
      direccion: ['', Validators.required],
      email: ['', [Validators.email]]
    });
    // Filtrar ciudades cuando cambie el departamento
    this.proveedorNaturalForm.get('departamento').valueChanges.subscribe(dept => {
      this.filtrarCiudades(dept);
      this.proveedorNaturalForm.get('ciudad').setValue('');
    });

    this.proveedorJuridicoForm.get('departamento').valueChanges.subscribe(dept => {
      this.filtrarCiudades(dept);
      this.proveedorJuridicoForm.get('ciudad').setValue('');
    });
  }

  ngOnInit() {
    this.http.get<any[]>('assets/codeDane/lista-colombia.json').subscribe(data => {
      this.todosLugares = data;
      this.cargarDepartamentosDesdeJson();
    });
  }

  cargarDepartamentosDesdeJson() {
    const unique = new Map();
    this.todosLugares.forEach(item => {
      if (!unique.has(item.StateCode)) {
        unique.set(item.StateCode, {
          value: item.StateCode,
          viewValue: item.StateName
        });
      }
    });
    this.departamentos = Array.from(unique.values());
  }

  filtrarCiudades(codigoDepartamento: string) {
    this.ciudades = this.todosLugares
      .filter(item => item.StateCode === codigoDepartamento)
      .map(item => ({
        value: item.CityCode,
        viewValue: item.CityName
      }));
    this.ciudadesFiltradas = [...this.ciudades];
  }

  get currentForm(): FormGroup {
    return this.selectedForm === 'natural' ? this.proveedorNaturalForm : this.proveedorJuridicoForm;
  }

  onSave(): void {
    const form = this.currentForm;

    if (form.valid) {
      const data = form.value;
      // Mapeo de campos según tipo de proveedor
      const isNatural = this.selectedForm === 'natural';
      const payload = {
        type: "Supplier", 
        person_type: (this.selectedForm == "juridico") ?"Company":"Person", 
        id_type: data.tipo_documento, // Puedes ajustar según tu lógica
        identification: data.numero_documento,
        name: isNatural
          ? [data.nombres, data.apellidos]
          : [data.razon_social, ''],
        commercial_name: data.nombre_comercial || '',
        vat_responsible: data.responsable_iva,
        fiscal_responsibilities: [{
          code: data.responsabilidad_fiscal
        }],
        address: {
          address: data.direccion,
          city: {
            country_code: data.pais,
            state_code: data.departamento,
            city_code: data.ciudad
          }
        },
        phone: [{
          indicative: data.indicativo_telefono,
          number: data.telefono,
          extension: data.extension_telefono
        }],
        contacts: [{
          first_name: isNatural ? data.nombres : data.razon_social,
          last_name: isNatural ? data.apellidos : '',
          email: data.email,
          phone: {
            indicative: data.indicativo_telefono,
            number: data.telefono,
            extension: data.extension_telefono
          }
        }]
      };
      console.log("data -> ",payload )
      this.dialogRef.close(payload);
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  switchForm(tipo: 'natural' | 'juridico'): void {
    this.selectedForm = tipo;
  }


}