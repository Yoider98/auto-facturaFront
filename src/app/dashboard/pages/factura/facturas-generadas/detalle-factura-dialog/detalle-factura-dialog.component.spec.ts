import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleFacturaDialogComponent } from './detalle-factura-dialog.component';

describe('DetalleFacturaDialogComponent', () => {
  let component: DetalleFacturaDialogComponent;
  let fixture: ComponentFixture<DetalleFacturaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleFacturaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleFacturaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 