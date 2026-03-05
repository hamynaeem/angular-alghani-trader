import { formatNumber } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FindTotal, GroupBy } from '../../utilities/utilities';

@Component({
  selector: 'ft-table-with-group',
  templateUrl: './table-with-group.component.html',
  styleUrls: ['./table-with-group.component.scss'],
})
export class TableWithGroupComponent implements OnInit, OnChanges {
  @Input('Settings') settings = {
    Columns: [],
    Actions: [],
    GroupBy: '',
  };

  @Input() Data: any = [];
  @Input() OnlyGroups = false;
  @Output() ClickAction: EventEmitter<any> = new EventEmitter<any>();
  public Groups: any = [];

  public GroupedData: any = [];

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

  constructor() {}

  ngOnInit() {}
  GetFldCounts() {
    return this.settings.Columns.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.Data) {
      this.GroupedData = GroupBy(this.Data, this.settings.GroupBy);
      console.log(this.GroupedData);
      this.Groups = Object.keys(this.GroupedData);
    }
  }

  ClickActionEv(r: any, a: any) {
    console.log('data', r);

    this.ClickAction.emit({ data: r, action: a });
    return false;
  }
  FindTotal(fld: any) {
    if (this.Data) {
      return formatNumber(FindTotal(this.Data, fld), 'en', '1.2-2');
    }
  }
  FindGroupTotal(fld: any, grp: any) {
    if (this.GroupedData) {
      return formatNumber(FindTotal(this.GroupedData[grp], fld), 'en', '1.2-2');
    }
  }

  formattedValue(row: any, col: any, data: any) {
    if (col.valueFormatter) return col.valueFormatter(row);
    else if (col.type == 'number' || col.sum) {
      return formatNumber(data, 'en', '1.2-2');
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
}
