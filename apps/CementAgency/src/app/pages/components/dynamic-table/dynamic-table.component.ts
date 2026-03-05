import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FindTotal, RoundTo2 } from '../../../factories/utilities';

@Component({
  selector: 'ft-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})

export class DynamicTableComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-input-rename
  @Input('Settings') settings = {
    Columns: [],
    Actions: [],
    SubTable: null,
    Checkbox: false,
  };
  SubTable: any;
  RowData: any = [];
  // tslint:disable-next-line:no-input-rename
  @Input('Data') Data: any = [];
  @Output() ClickAction: EventEmitter<any> = new EventEmitter<any>();
  @Input() Search:string = '';

  hasSubTable = false;

  constructor() { }

  ngOnInit() {
    // this.dtTrigger.next();
    if (this.settings.SubTable) {
      this.SubTable = this.settings.SubTable;
      this.hasSubTable = true;
    }
    console.log("Settings is:");
    console.log(this.settings);
  }
  GetFldCounts() {
    return this.settings.Columns.length;
  }
  ExandRow(e, i) {

    const icon:any = document.getElementById('icon' + i) ;
    const el:any = document.getElementById('rsub' + i);

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
      return RoundTo2(FindTotal(this.Data, fld));
    }

  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    // this.dtTrigger.unsubscribe();
  }
  checkAllCheckBox(ev) {
    this.Data.forEach(x => x.checked = ev.target.checked);
  }
  isAllCheckBoxChecked() {
    return this.Data ? this.Data.every(p => p.checked) : false;
  }
  public GetSelected() {
    const data = this.Data.filter(p => p.checked);
    // console.log(data);
    return data;
  }
}
