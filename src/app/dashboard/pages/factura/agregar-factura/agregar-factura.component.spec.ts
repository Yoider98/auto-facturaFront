import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarFacturaComponent } from './agregar-factura.component';

describe('AgregarFacturaComponent', () => {
  let component: AgregarFacturaComponent;
  let fixture: ComponentFixture<AgregarFacturaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarFacturaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
