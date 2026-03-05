import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpBase } from '../../../services/httpbase.service';
import { CountryService } from './country.service';


class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'ft-datatable',
  templateUrl: './ft-data-table.component.html',
  styleUrls: ['./ft-data-table.component.css'],
  providers: [CountryService, DecimalPipe]
})
export class FtDataTableComponent implements OnInit {
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;

  @Input() Settings: any = {
    columns: [],
    actions: [],
    crud: false,
    sort: null || []
  };
  @Input() Filter: any = "1=1";
  @Input() CRUD: boolean = false;
  @Output() ClickAction: EventEmitter<any> = new EventEmitter<any>();

  dtOptions: any = {};
  data: any = [];

  // We use this trigger because fetching the Settings of data can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any>  = new Subject<void>();
  selectedRow: any = null;

  constructor(private http: HttpBase) { }
  ngOnInit(): void {

    console.log(this.Settings);


    const that = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,


      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.filter = this.Filter;
        that.http
          .DataTable(this.Settings.tableName, dataTablesParameters).then((resp: DataTablesResponse) => {
            that.data = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: this.Settings.columns
    };
if (this.Settings.sort) {
  this.dtOptions.order = this.Settings.sort;
}

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  realoadTable(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      console.log('in reload');

      // Destroy the table first
      dtInstance.ajax.reload();
      this.clearRowSelection();
    });
  }
  SortByColumn(col, dir = 'asc'): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {


      // Destroy the table first
      dtInstance.order(  [col, dir ] ).draw();


    });
  }
  private selectRow(row: any): void {
    console.log(row);

    this.selectedRow = this.rowSelected(row) ? null : row;
  }
  private rowSelected(row: any): boolean {
    if (this.selectedRow) {
      return this.selectedRow[this.Settings.pk] === row[this.Settings.pk];
    }
    return false;
  }

  private clearRowSelection(): void {
    this.selectedRow = null;
  }
  ClickActionEv(r, a) {
    console.log(a);

    this.ClickAction.emit({ data: r, action: a });
    return false;
  }
  FilterTable(sFilter): void {
    this.Filter= sFilter;
    this.realoadTable();
  }
}

