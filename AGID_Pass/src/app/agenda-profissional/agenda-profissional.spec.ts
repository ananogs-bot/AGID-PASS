import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaProfissional } from './agenda-profissional';

describe('AgendaProfissional', () => {
  let component: AgendaProfissional;
  let fixture: ComponentFixture<AgendaProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaProfissional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaProfissional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
