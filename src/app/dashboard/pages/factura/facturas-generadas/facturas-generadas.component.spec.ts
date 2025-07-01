import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacturasGeneradasComponent } from './facturas-generadas.component';

describe('FacturasGeneradasComponent', () => {
  let component: FacturasGeneradasComponent;
  let fixture: ComponentFixture<FacturasGeneradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturasGeneradasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasGeneradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 