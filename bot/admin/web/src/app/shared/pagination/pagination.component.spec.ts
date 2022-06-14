import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NbButtonModule, NbIconModule, NbSelectModule, NbTooltipModule } from '@nebular/theme';

import { TestSharedModule } from '../test-shared.module';
import { PaginationComponent } from './pagination.component';

describe('NoDataFoundComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent],
      imports: [TestSharedModule, NbButtonModule, NbIconModule, NbSelectModule, NbTooltipModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.pagination = {
      pageEnd: 0,
      pageSize: 0,
      pageStart: 0,
      pageTotal: 0
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the back button if the beginning of the page is strictly less than 1', () => {
    spyOn(component.onPaginationChange, 'emit');
    const previousButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-back-outline"]')
    ).nativeElement.parentElement;

    previousButtonElement.click();

    expect(previousButtonElement.hasAttribute('disabled')).toBeTruthy();
    expect(component.onPaginationChange.emit).not.toHaveBeenCalled();
  });

  it('should enable the back button if the beginning of the page is strictly upper than 0', () => {
    component.pagination.pageStart = 1;
    component.pagination.pageSize = 10;
    fixture.detectChanges();
    const previousButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-back-outline"]')
    ).nativeElement.parentElement;

    expect(previousButtonElement.hasAttribute('disabled')).toBeFalsy();
  });

  it('should disable the next button if the end of the page is greater than or equal to the total of the result', () => {
    spyOn(component.onPaginationChange, 'emit');
    component.pagination.pageEnd = 22;
    component.pagination.pageTotal = 22;
    fixture.detectChanges();

    const nextButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-forward-outline"]')
    ).nativeElement.parentElement;

    nextButtonElement.click();

    expect(nextButtonElement.hasAttribute('disabled')).toBeTruthy();
    expect(component.onPaginationChange.emit).not.toHaveBeenCalled();

    component.pagination.pageEnd = 28;
    component.pagination.pageTotal = 22;
    fixture.detectChanges();
    nextButtonElement.click();

    expect(nextButtonElement.hasAttribute('disabled')).toBeTruthy();
    expect(component.onPaginationChange.emit).not.toHaveBeenCalled();
  });

  it('should enable the back button if the ending of the page is strictly less than the total of result', () => {
    component.pagination.pageEnd = 13;
    component.pagination.pageTotal = 22;
    fixture.detectChanges();
    const nextButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-forward-outline"]')
    ).nativeElement.parentElement;

    expect(nextButtonElement.hasAttribute('disabled')).toBeFalsy();
  });

  it('should reduce page start count based on page size when back button is clicked', () => {
    spyOn(component.onPaginationChange, 'emit');
    const pagination = {
      pageEnd: 10,
      pageSize: 5,
      pageStart: 9,
      pageTotal: 22
    };
    component.pagination = { ...pagination };
    fixture.detectChanges();
    const previousButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-back-outline"]')
    ).nativeElement.parentElement;

    previousButtonElement.click();

    expect(component.pagination).toEqual({ ...pagination, pageStart: 4 });
    expect(component.onPaginationChange.emit).toHaveBeenCalled();
  });

  it('should reduce the page start count to 0 if the difference between page start and page size is below 0 when the previous button is clicked', () => {
    spyOn(component.onPaginationChange, 'emit');
    const pagination = {
      pageEnd: 10,
      pageSize: 5,
      pageStart: 2,
      pageTotal: 22
    };
    component.pagination = { ...pagination };
    fixture.detectChanges();
    const previousButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-back-outline"]')
    ).nativeElement.parentElement;

    previousButtonElement.click();

    expect(component.pagination).toEqual({ ...pagination, pageStart: 0 });
    expect(component.onPaginationChange.emit).toHaveBeenCalled();
  });

  it('should increase page start count based on page size when next button is clicked', () => {
    spyOn(component.onPaginationChange, 'emit');
    const pagination = {
      pageEnd: 10,
      pageSize: 10,
      pageStart: 10,
      pageTotal: 22
    };
    component.pagination = { ...pagination };
    fixture.detectChanges();
    const nextButtonElement: HTMLElement = fixture.debugElement.query(
      By.css('[icon="arrow-ios-forward-outline"]')
    ).nativeElement.parentElement;

    nextButtonElement.click();

    expect(component.pagination).toEqual({ ...pagination, pageStart: 20 });
    expect(component.onPaginationChange.emit).toHaveBeenCalled();
  });
});
