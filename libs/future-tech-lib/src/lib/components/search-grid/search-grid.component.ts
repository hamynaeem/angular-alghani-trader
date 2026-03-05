import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CommandClickEventArgs,
  CommandModel,
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { HttpBase } from '../services/httpbase.service';

@Component({
  selector: 'ft-search-grid',
  templateUrl: './search-grid.component.html',
})
export class SearchGridComponent implements OnInit, AfterViewInit {
  @ViewChild('grid')
  public grid: GridComponent;
  @ViewChild('search') txtSearch;

  @Input() Table: string = '';
  @Input() Flds = [];
  @Input() Search = '';
  @Input() Orderby = '';
  @Input() DataSrvc: any;
  @Output() Event: EventEmitter<any> = new EventEmitter<any>();

  public data: any = [];
  public commands: CommandModel[];
  public selectionOptions: SelectionSettingsModel;
  constructor(private http: HttpBase) {}
  ngOnInit(): void {
    this.loadData();
    this.commands = [
      {
        buttonOption: { content: '', iconCss: 'fa fa-check', isPrimary: true },
      },
    ];
    this.selectionOptions = { type: 'Single', mode: 'Row' };
  }
  FilterData() {

    let term = this.Search.toLocaleLowerCase();

    this.data = this.DataSrvc.filter((x) => {
      if (term && !isNaN(Number(term))) {
        return Number(x.PCode) >= Number(term);
      } else {
        return x.ProductName.toLowerCase().includes(term);
      }
    });
  }
  ngAfterViewInit() {
    this.txtSearch.nativeElement.focus();
  }

  loadData() {

        this.data = [...this.DataSrvc];
  }

  RowClicked(e) {
    // const selectedrecords: object[] = this.grid.getSelectedRecords();  //

    this.Event.emit({ commnad: 'Row', data: e.data });
  }
  commandClick(args: CommandClickEventArgs): void {
    this.Event.emit({ commnad: 'OK', data: args.rowData });
  }
}
