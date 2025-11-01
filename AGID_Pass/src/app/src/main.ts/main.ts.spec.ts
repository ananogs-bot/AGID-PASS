import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTs } from './main.ts';

describe('MainTs', () => {
  let component: MainTs;
  let fixture: ComponentFixture<MainTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
