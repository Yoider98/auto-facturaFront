import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Factura, ItemProducto } from '../models/factura.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = environment.apiUrl + 'facturas'; // Ajusta esta URL según tu API

  constructor(private http: HttpClient) { }

  // Obtener todas las facturas
  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.apiUrl);
  }

  // Obtener una factura por ID
  getFactura(id: string): Observable<Factura> {
    return this.http.get<Factura>(`${environment.apiUrl}/searchFactura/${id}`);
  }

  // Crear una nueva factura
  createFactura(factura: Partial<Factura>): Observable<Factura> {
    return this.http.post<Factura>(`${environment.apiUrl}/crear-factura`, factura);
  }

  getToken(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/tokens/valid`);
  } 

  getMasterList(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/masterList`).pipe(
      tap(masterlist => {
        if(masterlist){
          // Filter centroCostos items
          const centroCostosItems = masterlist.filter((item: any) => item.field === "centroCosto");
          if (centroCostosItems.length > 0) {
            localStorage.setItem("centroCostos", JSON.stringify(centroCostosItems));
          }

          // Filter metodoPago items
          const metodoPagoItems = masterlist.filter((item: any) => item.field === "metodoPago");
          if (metodoPagoItems.length > 0) {
            localStorage.setItem("metodoPago", JSON.stringify(metodoPagoItems));
          }

           // Filter typeFacturaCompra items
           const tiposFactura = masterlist.filter((item: any) => item.field === "typeFacturaCompra");
           if (tiposFactura.length > 0) {
             localStorage.setItem("typeFacturaCompra", JSON.stringify(tiposFactura));
           }

           //Filter cuentaContable items
           const cuentaContable = masterlist.filter((item: any)=> item.field === "cuentaContable");
           if (cuentaContable.length > 0) {
            localStorage.setItem("cuentaContable", JSON.stringify(cuentaContable));
          }

          console.log("Masterlist",masterlist);
        }
      })
    );
  }


    getProveedor(nit: string): Observable<any> {
      return this.http.get<any>(`${environment.apiUrl}/searchProvider/${nit}`).pipe(
        tap(response => {
          if (response) {
            return of(response);
          }
          return of(null);
        })
      );
    }

    getActivoFijo(): Observable<any> {
      return this.http.get<any>(`${environment.apiUrl}/searchActivofijo`).pipe(
        tap(response => {
          if (response) {
            console.log("activos fijos -> ",response )
            // Mapeo para el select
            const activosFijosOptions = response.map((item: any) => ({
              value: item.id,
              label: `${item.name} - ${item.group}`
            }));
            //console.log("activos activosFijosOptions -> ",activosFijosOptions )
            // Guardar en localStorage o en una variable del servicio/componente
            localStorage.setItem("activosFijosOptions", JSON.stringify(activosFijosOptions));
            // O si es en el componente:
            // this.activosFijosOptions = activosFijosOptions;
          }
          return of(null);
        })
      );
    }

    // Guardar un nuevo proveedor
    guardarProveedor(proveedor: any): Observable<any> {
      return this.http.post<any>(`${environment.apiUrl}/crear-proveedor`, proveedor);
    }

}
