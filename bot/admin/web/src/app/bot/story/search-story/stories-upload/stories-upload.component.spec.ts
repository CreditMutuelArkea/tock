import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoriesUploadComponent } from './stories-upload.component';

describe('StoriesUploadComponent', () => {
  let component: StoriesUploadComponent;
  let fixture: ComponentFixture<StoriesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoriesUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoriesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
