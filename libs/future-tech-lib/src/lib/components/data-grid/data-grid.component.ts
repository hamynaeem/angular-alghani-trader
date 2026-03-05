import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ColumnModel,
  CommandClickEventArgs,
  CommandModel,
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { HttpBase } from '../services/httpbase.service';

@Component({
  selector: 'ft-data-grid',
  templateUrl: './data-grid.component.html',
})
export class FtDataGridComponent implements OnInit, OnChanges {
  @ViewChild('grid')
  public grid: GridComponent;
  @ViewChild('search') txtSearch;
  @ViewChild('template') colTemplate;

  @Input() Search = '';
  @Input() Orderby = '';
  @Input() ShowSearch = true;
  @Input() GridHeight = 400;

  @Input('Data') DataSrvc: any = [];
  @Output() Event: EventEmitter<any> = new EventEmitter<any>();
  @Output() RowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnLinkClick: EventEmitter<any> = new EventEmitter<any>();

  @Input() data: any[];
  @Input() columns: ColumnModel[] | any;

  // public data: any = [];
  public commands: CommandModel[];
  public selectionOptions: SelectionSettingsModel;
  constructor(private http: HttpBase, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.loadData();
    this.commands = [
      {
        buttonOption: { content: '', iconCss: 'fa fa-check', isPrimary: true },
      },
    ];
    this.columns = this.columns.map((col) => {
      return {
        ...col,
        template: this.colTemplate,
      };
    });

    this.selectionOptions = { type: 'Single', mode: 'Row' };
    this.columns.forEach((col) => {
      if (!col.width) col.width = 100;
      if (!col.Type) col.Type = 'text';
    });
  }
  FilterData() {
    let term = this.Search.toLocaleLowerCase();
    this.data = this.DataSrvc.filter((x) => {
      return x.ProductName.toLowerCase().includes(term);
    });
  }
  ngAfterViewInit() {
    if (this.ShowSearch)    this.txtSearch.nativeElement.focus();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      // Trigger change detection
      this.cdr.detectChanges();
      this.loadData();
      console.log(' in cdr');
    }
  }

  loadData() {
    let col: ColumnModel;

    this.data = [...this.DataSrvc];
  }

  GridRowClicked(e) {
    this.RowClicked.emit(e);
  }
  commandClick(args: CommandClickEventArgs): void {
    this.Event.emit({ commnad: 'OK', data: args.rowData });
  }
  public SetDataSource(data) {
    this.DataSrvc = data;
    this.loadData();
  }

  GetSelectedRecord() {
    return this.grid.getSelectedRecords();
  }

  GetTotalrecord() {
    return this.DataSrvc.length;
  }

  onRowDoubleClick(event) {
    console.log(event);
  }
  onDataBound(event: any): void {
    const gridInstance = event.sender; // Get the grid instance
    gridInstance.autoFitColumns();
  }

  log(d) {}
  OnLinkClicked(event) {
    this.OnLinkClick.emit(event);
  }
}
