import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwtOptionPageComponent } from './kwt-option-page.component';

describe('KwtOptionPageComponent', () => {
  let component: KwtOptionPageComponent;
  let fixture: ComponentFixture<KwtOptionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KwtOptionPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwtOptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
