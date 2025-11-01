import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsTs } from './models.js';

describe('ModelsTs', () => {
  let component: ModelsTs;
  let fixture: ComponentFixture<ModelsTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelsTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
