# Sub-table Background Color Testing

This document describes the tests created for the dynamic-table sub-row background color functionality.

## Test Files Created

### 1. `dynamic-table.component.spec.ts`
**Location**: `src/app/components/dynamic-table/`

**Purpose**: Comprehensive unit tests for the DynamicTableComponent's sub-table background color functionality.

**Test Coverage**:
- ✅ Default color when no config provided
- ✅ Legacy checked property support (yellow background)
- ✅ Purchase type background color (red)
- ✅ Sale type background color (lightgreen)
- ✅ Default color for non-matching conditions
- ✅ Multiple conditions with priority handling
- ✅ Single condition handling
- ✅ Fallback to main row config
- ✅ Parameter passing validation
- ✅ Function-based color configuration
- ✅ Integration with HTML template
- ✅ Edge cases (null data, missing properties)

### 2. `booking-report.component.sub-table-color.spec.ts`
**Location**: `src/app/pages/reports/booking-report/`

**Purpose**: Integration tests specific to the BookingReportComponent's sub-table coloring.

**Test Coverage**:
- ✅ Configuration validation
- ✅ Purchase type condition testing
- ✅ Sale type condition testing
- ✅ Other type condition testing
- ✅ Color function testing for Purchase (red)
- ✅ Color function testing for Sale (lightgreen)
- ✅ Integration with mock dynamic table
- ✅ Real-world mixed data scenarios
- ✅ Empty details array handling

## Running the Tests

### Run All Tests
```bash
ng test
```

### Run Specific Test File
```bash
# For dynamic-table component tests
ng test --include="**/dynamic-table.component.spec.ts"

# For booking-report sub-table color tests
ng test --include="**/booking-report.component.sub-table-color.spec.ts"
```

### Run Tests with Coverage
```bash
ng test --code-coverage
```

## Test Configuration Examples

### Basic Sub-table Color Configuration
```typescript
rowBackgroundConfig = {
  subRowBackgroundConfig: {
    condition: (subRow, subIndex, parentRow, parentIndex) => 
      subRow.Type === 'Purchase' || subRow.Type === 'Sale',
    color: (subRow, subIndex, parentRow, parentIndex) =>
      subRow.Type === 'Purchase' ? 'red' : 'lightgreen'
  }
};
```

### Multiple Conditions with Priority
```typescript
rowBackgroundConfig = {
  subRowBackgroundConfig: {
    conditions: [
      {
        condition: (subRow) => subRow.Type === 'Purchase',
        color: 'red',
        priority: 2
      },
      {
        condition: (subRow) => subRow.Amount > 1000,
        color: 'orange',
        priority: 1
      }
    ],
    defaultColor: 'white'
  }
};
```

## Expected Behavior

### Purchase Type Rows
- **Condition**: `subRow.Type === 'Purchase'`
- **Expected Color**: `red`
- **Test Cases**: ✅ Verified

### Sale Type Rows
- **Condition**: `subRow.Type === 'Sale'`
- **Expected Color**: `lightgreen`
- **Test Cases**: ✅ Verified

### Other Type Rows
- **Condition**: Not matching Purchase or Sale
- **Expected Color**: Default (white)
- **Test Cases**: ✅ Verified

## Test Data Structure

```typescript
// Sample test data structure
const mockData = [
  {
    BookingID: '12345',
    CustomerName: 'Test Customer',
    expanded: true,
    details: [
      { Type: 'Purchase', ProductName: 'Cement', Amount: 1000 },
      { Type: 'Sale', ProductName: 'Cement', Amount: 1200 },
      { Type: 'Transport', ProductName: 'Delivery', Amount: 100 }
    ]
  }
];
```

## Validation Points

1. **Function Parameters**: Tests verify that condition and color functions receive correct parameters in the right order
2. **Color Application**: Tests verify that colors are applied correctly based on Type property
3. **Edge Cases**: Tests handle null/undefined data and missing properties
4. **Integration**: Tests verify that configuration works with the actual component template
5. **Performance**: Tests ensure efficient color calculation without unnecessary re-renders

## Debugging Tips

If tests fail, check:
1. Parameter order in HTML template method calls
2. Condition function logic
3. Color function return values
4. TypeScript types and interfaces
5. Mock data structure matches expected format

## Next Steps

To extend testing:
1. Add performance tests for large datasets
2. Add visual regression tests
3. Add accessibility tests for color contrast
4. Add tests for print functionality with colors
5. Add tests for different browser compatibility
