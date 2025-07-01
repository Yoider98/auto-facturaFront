export interface ItemProducto {
  id?: string;
  facturaId?: string;
  descripcion: string;
  cantidad: string;
  descuento?: string;
  impuesto: {
    nombre: string;
    porcentaje: string;
    base: string;
    valor: string;
  };
  precioUnit: {
    valor: string;
    base: string;
  };
  subtotal: string;
  total: string;
  tipoProducto: string;
  cuentaContable?: string;  // Added cuentaContable as optional property
}

export interface Factura {
  generated?: boolean;
  idSigo?: string;
  id?: string;
  numero: string;
  uuid?: string;
  fecha: string | Date;
  fechaVencimiento?: string | Date;
  fechaRecepcion?: string | Date;
  tipoDocumento: string;
  divisa: string;
  idEmisor: string;
  idReceptor: string;
  emisor:object,
  receptor:object,
  formaPago: string;
  medioPago: string;
  subtotal: number;
  impuestos: number;
  total: number;
  itemsProductos: ItemProducto[];
}
