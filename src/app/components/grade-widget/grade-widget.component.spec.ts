import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeWidgetComponent } from './grade-widget.component';

describe('GradeWidgetComponent', () => {
  let component: GradeWidgetComponent;
  let fixture: ComponentFixture<GradeWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GradeWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
