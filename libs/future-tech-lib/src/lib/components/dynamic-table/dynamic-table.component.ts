import { formatNumber } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FindTotal, GroupBy } from '../../utilities/utilities';
import { HttpBase } from '../services/httpbase.service';

/**
 * DynamicTableComponent - A flexible table component with dynamic row background colors
 *
 * Row Background Color Configuration:
 *
 * Usage Examples:
 *
 * 1. Single condition with custom color:
 * <ft-dynamic-table
 *   [rowBackgroundConfig]="{
 *     condition: (row, index) => row.status === 'active',
 *     color: 'lightgreen',
 *     defaultColor: 'white'
 *   }"
 *   [Data]="tableData">
 * </ft-dynamic-table>
 *
 * 2. Multiple conditions with priorities:
 * <ft-dynamic-table
 *   [rowBackgroundConfig]="{
 *     conditions: [
 *       { condition: (row, index) => row.priority === 'high', color: 'red', priority: 3 },
 *       { condition: (row, index) => row.priority === 'medium', color: 'orange', priority: 2 },
 *       { condition: (row, index) => row.priority === 'low', color: 'lightblue', priority: 1 }
 *     ],
 *     defaultColor: 'white'
 *   }"
 *   [Data]="tableData">
 * </ft-dynamic-table>
 *
 * 3. Index-based conditions:
 * <ft-dynamic-table
 *   [rowBackgroundConfig]="{
 *     condition: (row, index) => index % 2 === 0,
 *     color: 'lightgray',
 *     defaultColor: 'white'
 *   }"
 *   [Data]="tableData">
 * </ft-dynamic-table>
 *
 * Sub-table Row Coloring:
 * By default, sub-table rows use the same conditions as main rows unless you provide a
 * `subRowBackgroundConfig` inside `rowBackgroundConfig`. If `subRowBackgroundConfig` is set,
 * it will be used for sub-table rows; otherwise, main row conditions apply.
 *
 * Example for sub-table row coloring:
 * <ft-dynamic-table
 *   [rowBackgroundConfig]="{
 *     subRowBackgroundConfig: {
 *       condition: (subRow, subIndex, parentRow, parentIndex) => subRow.flag,
 *       color: 'lightyellow'
 *     }
 *   }"
 *   [Data]="tableData">
 * </ft-dynamic-table>
 */

@Component({
  selector: 'ft-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
})
/**
 * A highly configurable dynamic table component for Angular.
 *
 * Supports features such as dynamic columns, row actions, sub-tables, grouping, searching,
 * row selection with checkboxes, and customizable row background coloring based on conditions.
 *
 * ### Inputs
 * - `settings`: Table configuration object (columns, actions, sub-table, etc).
 * - `Data`: Array of row data to display.
 * - `rowBackgroundConfig`: Configuration for conditional row background colors.
 * - `Search`: Search/filter string.
 * - `Groupby`: Field name to group data by.
 *
 * ### Outputs
 * - `ClickAction`: Emits when a row action is triggered.
 * - `RowClicked`: Emits when a row is clicked or expanded.
 *
 * ### Row Background Color
 * Use the `rowBackgroundConfig` input to control row coloring:
 *
 * ```typescript
 * <app-dynamic-table
 *   [Data]="myData"
 *   [settings]="mySettings"
 *   [rowBackgroundConfig]="{
 *     conditions: [
 *       { condition: (row) => row.status === 'error', color: 'red', priority: 2 },
 *       { condition: (row) => row.amount > 1000, color: 'lightgreen', priority: 1 }
 *     ],
 *     defaultColor: 'white'
 *   }"
 * ></app-dynamic-table>
 * ```
 *
 * ### Sub-table Row Coloring
 * Optionally, provide a `subRowBackgroundConfig` inside `rowBackgroundConfig` for sub-rows:
 *
 * ```typescript
 * [rowBackgroundConfig]="{
 *   subRowBackgroundConfig: {
 *     condition: (subRow, subIndex, parentRow) => subRow.flag,
 *     color: 'lightyellow'
 *   }
 * }"
 * ```
 *
 * ### Example Usage
 * ```typescript
 * <app-dynamic-table
 *   [Data]="users"
 *   [settings]="{
 *     Columns: [{ field: 'name', label: 'Name' }, { field: 'age', label: 'Age', type: 'number' }],
 *     Actions: [{ label: 'Edit', icon: 'fa-edit', action: 'edit' }]
 *   }"
 *   (ClickAction)="onAction($event)"
 *   (RowClicked)="onRowClick($event)"
 * ></app-dynamic-table>
 * ```
 *
 * @example
 * // See above for usage examples.
 *
 * @remarks
 * - Supports legacy `checked` property for backward compatibility (highlights row yellow).
 * - Grouping and searching are handled via `Groupby` and `Search` inputs.
 * - Sub-table support via `settings.SubTable`.
 *
 * @see rowBackgroundConfig for advanced row coloring options.
 */
export class DynamicTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input('Settings') settings = {
    Columns: [],
    Actions: [],
    SubTable: null,
    Checkbox: false,
    crud: false,
    ButtonsAtRight: false,
  };

  // Add row background color configuration
  @Input() rowBackgroundConfig: {
    condition?: (row: any, index: number) => boolean;
    color?: string;
    conditions?: Array<{
      condition: (row: any, index: number) => boolean;
      color: string;
      priority?: number;
    }>;
    defaultColor?: string;
  } = {};

  SubTable: any;
  RowData: any = [];

  @Input('Data') Data: any = [];
  @Output() ClickAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() RowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() Search: string = '';
  @Input() Groupby: string = '';
  public GroupedData: any = [];
  hasSubTable = false;

  constructor(private http: HttpBase) {}

  ngOnInit() {
    if (this.settings.SubTable) {
      this.SubTable = this.settings.SubTable;
      this.SubTable.table = this.SubTable.table || 'items';
      this.hasSubTable = true;
    }
    console.log('Settings is:');
    console.log(this.settings);
  }
  GetFldCounts() {
    return this.settings.Columns.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.Groupby == '') {
      this.GroupedData.push({ group: '', Data: this.Data });
    } else {
      this.GroupedData = GroupBy(this.Data, this.Groupby);
    }
  }
  ExandRow(e, i) {
    this.RowClicked.emit({ data: this.Data[i], index: i });

    const icon: any = document.getElementById('icon' + i);
    const el: any = document.getElementById('rsub' + i);

    if (this.Data[i].expanded) {
      el.style.visibility = 'hidden';
      icon.classList.remove('fa-minus');
      icon.classList.add('fa-plus');
      this.Data[i].expanded = false;
    } else {
      if (el) {
        el.style.visibility = 'visible';
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
        this.Data[i].expanded = true;

        // Auto-load subtable data if configuration is defined
        if (
          this.SubTable &&
          this.SubTable.subTable &&
          this.SubTable.foreignKey
        ) {
          // Check if data is already loaded
          if (!this.Data[i]._subTableLoaded) {
            const foreignKeyValue = this.Data[i][this.SubTable.foreignKey];
            const filter = `${this.SubTable.foreignKey}='${foreignKeyValue}'`;

            this.http
              .getData(this.SubTable.subTable, { filter: filter })
              .then((result: any) => {
                // Store the loaded data in the appropriate field
                this.Data[i][this.SubTable.table] = result;
                // Mark as loaded
                this.Data[i]._subTableLoaded = true;
              })
              .catch((error) => {
                console.error('Error loading subtable data:', error);
              });
          }
        }
      }
    }
  }

  ClickActionEv(r, a) {
    console.log('data', r);

    this.ClickAction.emit({ data: r, action: a });
    return false;
  }
  FindTotal(fld) {
    if (this.Data) {
      return formatNumber(FindTotal(this.Data, fld) || 0, 'en', '1.2-2');
    }
  }
  ngOnDestroy(): void {}
  checkAllCheckBox(ev) {
    this.Data.forEach((x) => (x.checked = ev.target.checked));
  }
  isAllCheckBoxChecked() {
    return this.Data ? this.Data.every((p) => p.checked) : false;
  }
  public GetSelected() {
    const data = this.Data.filter((p) => p.checked);
    // console.log(data);
    return data;
  }
  formattedValue(row: any, col: any, data: any) {
    if (col.valueFormatter) return col.valueFormatter(row);
    else if (col.type == 'number' || col.sum) {
      return formatNumber(data || 0, 'en', '1.2-2');
    } else return data;
  }

  /**
   * Get the background color for a specific row based on conditions
   * @param row - The row data
   * @param index - The row index
   * @returns The background color string
   */
  getRowBackgroundColor(row: any, index: number): string {
    // If legacy checked property exists and is true, return yellow (backward compatibility)
    if (row.checked) {
      return 'yellow';
    }

    // If no background config is provided, return default
    if (
      !this.rowBackgroundConfig ||
      Object.keys(this.rowBackgroundConfig).length === 0
    ) {
      return 'white';
    }

    // Check multiple conditions with priority (higher priority wins)
    if (
      this.rowBackgroundConfig.conditions &&
      this.rowBackgroundConfig.conditions.length > 0
    ) {
      // Sort conditions by priority (higher first)
      const sortedConditions = this.rowBackgroundConfig.conditions
        .slice()
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const conditionConfig of sortedConditions) {
        if (conditionConfig.condition(row, index)) {
          return conditionConfig.color;
        }
      }
    }

    // Check single condition
    if (
      this.rowBackgroundConfig.condition &&
      this.rowBackgroundConfig.condition(row, index)
    ) {
      return this.rowBackgroundConfig.color || 'lightblue';
    }

    // Return default color
    return this.rowBackgroundConfig.defaultColor || 'white';
  }

  /**
   * Get the background color for a sub-row (child row) based on conditions.
   * Falls back to main row config if no specific config is provided.
   * @param subRow - The sub-row data
   * @param parentRow - The parent row data
   * @param subIndex - The sub-row index
   * @param parentIndex - The parent row index
   * @returns The background color string
   */
  getSubRowBackgroundColor(
    subRow: any,
    parentRow: any,
    subIndex: number,
    parentIndex: number
  ): string {
    // If legacy checked property exists and is true, return yellow (backward compatibility)
    if (subRow.checked) {
      return 'yellow';
    }

    // If no background config is provided, return default
    if (
      !this.rowBackgroundConfig ||
      Object.keys(this.rowBackgroundConfig).length === 0
    ) {
      return 'white';
    }

    // If a specific subRowBackgroundConfig exists, use it (optional extension)
    if ((this.rowBackgroundConfig as any).subRowBackgroundConfig) {
      const config = (this.rowBackgroundConfig as any).subRowBackgroundConfig;

      // Multiple conditions with priority
      if (config.conditions && config.conditions.length > 0) {
        const sortedConditions = config.conditions
          .slice()
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        for (const conditionConfig of sortedConditions) {
          if (
            conditionConfig.condition(subRow, subIndex, parentRow, parentIndex)
          ) {
            return conditionConfig.color;
          }
        }
      }

      // Single condition
      if (
        config.condition &&
        config.condition(subRow, subIndex, parentRow, parentIndex)
      ) {
        return config.color || 'lightblue';
      }

      // Default color for sub-row
      return config.defaultColor || 'white';
    }

    // Fallback: use main row config logic, but pass subRow/subIndex
    return this.getRowBackgroundColor(subRow, subIndex);
  }
  FindSubTotal(subdata, col) {
    if (subdata) {
      return formatNumber(FindTotal(subdata, col) || 0, 'en', '1.2-2');
    }
  }
}
