import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaFacturasComponent } from './lista-facturas.component';

describe('ListaFacturasComponent', () => {
  let component: ListaFacturasComponent;
  let fixture: ComponentFixture<ListaFacturasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaFacturasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
