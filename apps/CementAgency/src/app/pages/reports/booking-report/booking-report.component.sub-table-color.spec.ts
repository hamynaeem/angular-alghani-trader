import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { BookingReportComponent } from './booking-report.component';

// Mock the dynamic table component for isolated testing
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ft-dynamic-table',
  template: `
    <div class="mock-dynamic-table">
      <div *ngFor="let row of Data; let i = index" class="main-row">
        <div *ngIf="row.expanded && Settings.SubTable" class="sub-table">
          <div
            *ngFor="let subRow of row[Settings.SubTable.table]; let j = index"
            class="sub-row"
            [style.background-color]="getTestBackgroundColor(subRow, row, j, i)"
            [attr.data-sub-type]="subRow.Type">
            {{ subRow.Type }} - {{ subRow.Amount }}
          </div>
        </div>
      </div>
    </div>
  `
})
class MockDynamicTableComponent {
  @Input() Settings: any;
  @Input() Data: any;
  @Input() rowBackgroundConfig: any;
  @Output() ClickAction = new EventEmitter();
  @Output() RowClicked = new EventEmitter();

  // Simulate the background color logic for testing
  getTestBackgroundColor(subRow: any, parentRow: any, subIndex: number, parentIndex: number): string {
    if (!this.rowBackgroundConfig?.subRowBackgroundConfig) {
      return 'white';
    }

    const config = this.rowBackgroundConfig.subRowBackgroundConfig;
    if (config.condition && config.condition(subRow, subIndex, parentRow, parentIndex)) {
      if (typeof config.color === 'function') {
        return config.color(subRow, subIndex, parentRow, parentIndex);
      }
      return config.color || 'lightblue';
    }

    return config.defaultColor || 'white';
  }
}

describe('BookingReportComponent - Sub-table Background Color Integration', () => {
  let component: BookingReportComponent;
  let fixture: ComponentFixture<BookingReportComponent>;
  let httpBaseSpy: jasmine.SpyObj<HttpBase>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpBase', ['getData']);

    await TestBed.configureTestingModule({
      declarations: [
        BookingReportComponent,
        MockDynamicTableComponent
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NgbModule
      ],
      providers: [
        { provide: HttpBase, useValue: httpSpy },
        PrintDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingReportComponent);
    component = fixture.componentInstance;
    httpBaseSpy = TestBed.inject(HttpBase) as jasmine.SpyObj<HttpBase>;
  });

  describe('rowBackgroundConfig for sub-table rows', () => {
    it('should be configured correctly for Purchase and Sale types', () => {
      expect(component.rowBackgroundConfig).toBeDefined();
      expect(component.rowBackgroundConfig.subRowBackgroundConfig).toBeDefined();

      const config = component.rowBackgroundConfig.subRowBackgroundConfig;
      expect(config.condition).toBeDefined();
      expect(config.color).toBeDefined();
    });

    it('should return true for Purchase type in condition', () => {
      const condition = component.rowBackgroundConfig.subRowBackgroundConfig.condition;
      const mockSubRow = { Type: 'Purchase' };

      const result = condition(mockSubRow, 0, {}, 0);

      expect(result).toBe(true);
    });

    it('should return true for Sale type in condition', () => {
      const condition = component.rowBackgroundConfig.subRowBackgroundConfig.condition;
      const mockSubRow = { Type: 'Sale' };

      const result = condition(mockSubRow, 0, {}, 0);

      expect(result).toBe(true);
    });

    it('should return false for other types in condition', () => {
      const condition = component.rowBackgroundConfig.subRowBackgroundConfig.condition;
      const mockSubRow = { Type: 'Other' };

      const result = condition(mockSubRow, 0, {}, 0);

      expect(result).toBe(false);
    });

    it('should return red color for Purchase type', () => {
      const colorFunction = component.rowBackgroundConfig.subRowBackgroundConfig.color;
      const mockSubRow = { Type: 'Purchase' };

      const result = colorFunction(mockSubRow, 0, {}, 0);

      expect(result).toBe('red');
    });

    it('should return lightgreen color for Sale type', () => {
      const colorFunction = component.rowBackgroundConfig.subRowBackgroundConfig.color;
      const mockSubRow = { Type: 'Sale' };

      const result = colorFunction(mockSubRow, 0, {}, 0);

      expect(result).toBe('lightgreen');
    });
  });

  describe('Integration with mock dynamic table', () => {
    beforeEach(() => {
      // Mock the HTTP response
      const mockBookingData = [
        {
          BookingID: '12345',
          CustomerName: 'Test Customer',
          Date: '2025-01-01',
          expanded: true,
          details: [
            { Type: 'Purchase', ProductName: 'Cement', Amount: 1000 },
            { Type: 'Sale', ProductName: 'Cement', Amount: 1200 },
            { Type: 'Other', ProductName: 'Transport', Amount: 100 }
          ]
        }
      ];

      httpBaseSpy.getData.and.returnValue(Promise.resolve(mockBookingData));

      component.data = mockBookingData;
      fixture.detectChanges();
    });

    it('should render sub-rows with correct background colors', async () => {
      // Wait for async data loading
      await fixture.whenStable();
      fixture.detectChanges();

      const subRows = fixture.nativeElement.querySelectorAll('.sub-row');

      expect(subRows.length).toBe(3);

      // Check Purchase row (red background)
      const purchaseRow = Array.from(subRows).find((row: any) =>
        row.getAttribute('data-sub-type') === 'Purchase'
      ) as HTMLElement;
      expect(purchaseRow?.style.backgroundColor).toBe('red');

      // Check Sale row (lightgreen background)
      const saleRow = Array.from(subRows).find((row: any) =>
        row.getAttribute('data-sub-type') === 'Sale'
      ) as HTMLElement;
      expect(saleRow?.style.backgroundColor).toBe('lightgreen');

      // Check Other row (default/white background)
      const otherRow = Array.from(subRows).find((row: any) =>
        row.getAttribute('data-sub-type') === 'Other'
      ) as HTMLElement;
      expect(otherRow?.style.backgroundColor).toBe('white');
    });

    it('should handle empty details array', () => {
      component.data = [
        {
          BookingID: '12345',
          CustomerName: 'Test Customer',
          Date: '2025-01-01',
          expanded: true,
          details: []
        }
      ];

      fixture.detectChanges();

      const subRows = fixture.nativeElement.querySelectorAll('.sub-row');
      expect(subRows.length).toBe(0);
    });
  });

  describe('Real-world scenario testing', () => {
    it('should handle mixed Purchase and Sale data correctly', () => {
      const testData = [
        { Type: 'Purchase', Amount: 1000 },
        { Type: 'Sale', Amount: 1200 },
        { Type: 'Purchase', Amount: 800 },
        { Type: 'Sale', Amount: 1500 },
        { Type: 'Transport', Amount: 200 }
      ];

      testData.forEach((subRow, index) => {
        const condition = component.rowBackgroundConfig.subRowBackgroundConfig.condition;
        const color = component.rowBackgroundConfig.subRowBackgroundConfig.color;

        const shouldMatch = subRow.Type === 'Purchase' || subRow.Type === 'Sale';
        expect(condition(subRow, index, {}, 0)).toBe(shouldMatch);

        if (shouldMatch) {
          const expectedColor = subRow.Type === 'Purchase' ? 'red' : 'lightgreen';
          expect(color(subRow, index, {}, 0)).toBe(expectedColor);
        }
      });
    });
  });
});
