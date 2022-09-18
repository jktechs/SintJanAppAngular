import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectListPageComponent } from './subject-list-page.component';

describe('SubjectListPageComponent', () => {
  let component: SubjectListPageComponent;
  let fixture: ComponentFixture<SubjectListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
