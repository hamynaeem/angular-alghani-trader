import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicTableComponent } from '../../../../../../libs/future-tech-lib/src/lib/components/dynamic-table/dynamic-table.component';

describe('DynamicTableComponent - Sub-table Background Color', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicTableComponent],
      imports: [FormsModule, NgbModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
  });

  describe('getSubRowBackgroundColor', () => {
    let mockSubRow: any;
    let mockParentRow: any;
    const subIndex = 0;
    const parentIndex = 0;

    beforeEach(() => {
      mockSubRow = { Type: 'Purchase', ProductName: 'Test Product' };
      mockParentRow = { BookingID: '12345', CustomerName: 'Test Customer' };
    });

    it('should return default color when no config is provided', () => {
      component.rowBackgroundConfig = {};

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('white');
    });

    it('should return yellow for checked sub-rows (legacy support)', () => {
      mockSubRow.checked = true;
      component.rowBackgroundConfig = {};

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('yellow');
    });

    it('should apply Purchase type background color (red)', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
            subRow.Type === 'Purchase' || subRow.Type === 'Sale',
          color: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
            subRow.Type === 'Purchase' ? 'red' : 'lightgreen'
        }
      };

      mockSubRow.Type = 'Purchase';

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('red');
    });

    it('should apply Sale type background color (lightgreen)', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
            subRow.Type === 'Purchase' || subRow.Type === 'Sale',
          color: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
            subRow.Type === 'Purchase' ? 'red' : 'lightgreen'
        }
      };

      mockSubRow.Type = 'Sale';

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('lightgreen');
    });

    it('should return default color for sub-rows that do not match condition', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
            subRow.Type === 'Purchase' || subRow.Type === 'Sale',
          color: 'red',
          defaultColor: 'lightgray'
        }
      };

      mockSubRow.Type = 'Unknown';

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('lightgray');
    });

    it('should handle multiple conditions with priority', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          conditions: [
            {
              condition: (subRow: any) => subRow.Type === 'Purchase',
              color: 'red',
              priority: 2
            },
            {
              condition: (subRow: any) => subRow.Amount > 1000,
              color: 'orange',
              priority: 1
            }
          ],
          defaultColor: 'white'
        }
      };

      mockSubRow = { Type: 'Purchase', Amount: 1500 };

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      // Should return 'red' because Purchase condition has higher priority
      expect(result).toBe('red');
    });

    it('should use single condition when multiple conditions are not provided', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any) => subRow.Type === 'Purchase',
          color: 'red'
        }
      };

      mockSubRow.Type = 'Purchase';

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('red');
    });

    it('should fallback to main row config when subRowBackgroundConfig is not provided', () => {
      component.rowBackgroundConfig = {
        condition: (row: any) => row.Type === 'Purchase',
        color: 'blue'
      };

      mockSubRow.Type = 'Purchase';

      const result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);

      expect(result).toBe('blue');
    });

    it('should pass correct parameters to condition function', () => {
      const conditionSpy = jasmine.createSpy('condition').and.returnValue(true);
      const colorSpy = jasmine.createSpy('color').and.returnValue('testcolor');

      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: conditionSpy,
          color: colorSpy
        }
      };

      const testSubIndex = 5;
      const testParentIndex = 3;

      component.getSubRowBackgroundColor(mockSubRow, mockParentRow, testSubIndex, testParentIndex);

      expect(conditionSpy).toHaveBeenCalledWith(mockSubRow, testSubIndex, mockParentRow, testParentIndex);
      expect(colorSpy).toHaveBeenCalledWith(mockSubRow, testSubIndex, mockParentRow, testParentIndex);
    });

    it('should handle function-based color configuration', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any) => subRow.Type === 'Purchase' || subRow.Type === 'Sale',
          color: (subRow: any) => {
            switch (subRow.Type) {
              case 'Purchase': return 'red';
              case 'Sale': return 'lightgreen';
              default: return 'gray';
            }
          }
        }
      };

      // Test Purchase
      mockSubRow.Type = 'Purchase';
      let result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);
      expect(result).toBe('red');

      // Test Sale
      mockSubRow.Type = 'Sale';
      result = component.getSubRowBackgroundColor(mockSubRow, mockParentRow, subIndex, parentIndex);
      expect(result).toBe('lightgreen');
    });
  });

  describe('Integration Test - HTML Template', () => {
    beforeEach(() => {
      // Setup component with sub-table configuration
      component.settings = {
        Columns: [
          { label: 'Product', fldName: 'ProductName' },
          { label: 'Type', fldName: 'Type' }
        ],
        Actions: [],
        SubTable: {
          table: 'details',
          Columns: [
            { label: 'Type', fldName: 'Type' },
            { label: 'Amount', fldName: 'Amount' }
          ]
        },
        Checkbox: false,
        crud: false,
        ButtonsAtRight: false
      };

      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any) => subRow.Type === 'Purchase' || subRow.Type === 'Sale',
          color: (subRow: any) => subRow.Type === 'Purchase' ? 'red' : 'lightgreen'
        }
      };

      component.Data = [
        {
          ProductName: 'Product 1',
          Type: 'Main',
          expanded: true,
          details: [
            { Type: 'Purchase', Amount: 1000 },
            { Type: 'Sale', Amount: 1200 },
            { Type: 'Other', Amount: 500 }
          ]
        }
      ];

      component.hasSubTable = true;
      fixture.detectChanges();
    });

    it('should apply correct background colors to sub-rows in template', () => {
      const subRows = fixture.nativeElement.querySelectorAll('tbody tr');

      // Find sub-table rows (they should be after the main row)
      const subTableRows = Array.from(subRows).filter((row: any) =>
        row.style.backgroundColor !== '' &&
        row.querySelector('td[colspan]') === null
      );

      expect(subTableRows.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined sub-row data', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any) => subRow && subRow.Type === 'Purchase',
          color: 'red'
        }
      };

      const result = component.getSubRowBackgroundColor(null, {}, 0, 0);

      expect(result).toBe('white');
    });

    it('should handle missing Type property', () => {
      component.rowBackgroundConfig = {
        subRowBackgroundConfig: {
          condition: (subRow: any) => subRow.Type === 'Purchase',
          color: 'red',
          defaultColor: 'lightgray'
        }
      };

      const subRowWithoutType = { ProductName: 'Test' };

      const result = component.getSubRowBackgroundColor(subRowWithoutType, {}, 0, 0);

      expect(result).toBe('lightgray');
    });
  });
});
