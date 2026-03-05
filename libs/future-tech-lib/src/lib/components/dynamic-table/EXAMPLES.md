# Dynamic Table Row Background Color Examples

The `DynamicTableComponent` now supports dynamic row background colors based on custom conditions. Here are various usage examples:

## Basic Usage

### 1. Single Condition
```typescript
// Component
export class MyComponent {
  tableData = [
    { id: 1, name: 'John', status: 'active' },
    { id: 2, name: 'Jane', status: 'inactive' },
    { id: 3, name: 'Bob', status: 'active' }
  ];

  backgroundConfig = {
    condition: (row: any, index: number) => row.status === 'active',
    color: 'lightgreen',
    defaultColor: 'white'
  };
}
```

```html
<!-- Template -->
<ft-dynamic-table 
  [Data]="tableData"
  [Settings]="tableSettings"
  [rowBackgroundConfig]="backgroundConfig">
</ft-dynamic-table>
```

### 2. Multiple Conditions with Priority
```typescript
export class MyComponent {
  priorityBackgroundConfig = {
    conditions: [
      { 
        condition: (row: any, index: number) => row.priority === 'high', 
        color: '#ffebee', 
        priority: 3 
      },
      { 
        condition: (row: any, index: number) => row.priority === 'medium', 
        color: '#fff3e0', 
        priority: 2 
      },
      { 
        condition: (row: any, index: number) => row.priority === 'low', 
        color: '#e8f5e8', 
        priority: 1 
      }
    ],
    defaultColor: 'white'
  };

  tableData = [
    { id: 1, name: 'Task 1', priority: 'high' },
    { id: 2, name: 'Task 2', priority: 'medium' },
    { id: 3, name: 'Task 3', priority: 'low' }
  ];
}
```

### 3. Index-Based Styling (Alternating Rows)
```typescript
export class MyComponent {
  alternatingConfig = {
    condition: (row: any, index: number) => index % 2 === 0,
    color: '#f5f5f5',
    defaultColor: 'white'
  };
}
```

### 4. Complex Conditions
```typescript
export class MyComponent {
  complexConfig = {
    conditions: [
      {
        condition: (row: any, index: number) => row.amount > 1000 && row.status === 'pending',
        color: '#ffcdd2',
        priority: 5
      },
      {
        condition: (row: any, index: number) => row.amount > 500,
        color: '#fff9c4',
        priority: 3
      },
      {
        condition: (row: any, index: number) => row.status === 'completed',
        color: '#c8e6c9',
        priority: 2
      }
    ],
    defaultColor: 'white'
  };

  tableData = [
    { id: 1, amount: 1200, status: 'pending' },    // Red background (highest priority)
    { id: 2, amount: 800, status: 'completed' },   // Green background
    { id: 3, amount: 600, status: 'pending' },     // Yellow background
    { id: 4, amount: 300, status: 'pending' }      // White background (default)
  ];
}
```

### 5. Date-Based Conditions
```typescript
export class MyComponent {
  dateConfig = {
    conditions: [
      {
        condition: (row: any, index: number) => {
          const dueDate = new Date(row.dueDate);
          const today = new Date();
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays < 0; // Overdue
        },
        color: '#ffcdd2',
        priority: 3
      },
      {
        condition: (row: any, index: number) => {
          const dueDate = new Date(row.dueDate);
          const today = new Date();
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3; // Due soon
        },
        color: '#fff3e0',
        priority: 2
      }
    ],
    defaultColor: 'white'
  };
}
```

## Configuration Options

### rowBackgroundConfig Properties

- **condition**: `(row: any, index: number) => boolean` - Single condition function
- **color**: `string` - Color to apply when condition is met
- **conditions**: `Array` - Multiple conditions with priorities
  - **condition**: `(row: any, index: number) => boolean` - Condition function
  - **color**: `string` - Color to apply
  - **priority**: `number` - Higher numbers have precedence (optional, default: 0)
- **defaultColor**: `string` - Default background color (optional, default: 'white')

## Notes

1. **Backward Compatibility**: The component still supports the legacy `checked` property for yellow highlighting
2. **Priority System**: Higher priority conditions override lower priority ones
3. **Flexible Conditions**: You can use any row data or index-based logic
4. **Performance**: Conditions are evaluated on each render, so keep them lightweight
5. **CSS Colors**: Use any valid CSS color value (hex, rgb, named colors, etc.)
