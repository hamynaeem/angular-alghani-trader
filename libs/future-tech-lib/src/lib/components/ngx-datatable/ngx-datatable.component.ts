import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ColumnMode,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { formatNumber } from '@angular/common';
import { FindTotal } from '../../utilities/utilities';

@Component({
  selector: 'ft-ngx-datatable',
  templateUrl: './ngx-datatable.component.html',
  styleUrls: ['./ngx-datatable.component.scss', ],
  encapsulation: ViewEncapsulation.None,
})
export class NgxDatatableComponent implements OnInit {
  @Input('Settings') settings = {
    Columns: [],
    Actions: [],
    SubTable: null,
    Checkbox: false,
    crud: false,
    ButtonsAtRight: false,
  };
  SubTable: any;
  RowData: any = [];

  @Input('Data') Data: any = [];
  @Output() ClickAction: EventEmitter<any> = new EventEmitter<any>();
  @Input() Search: string = '';
  @Input() Groupby: string = '';
  public GroupedData: any = [];

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  constructor() {}

  ngOnInit() {
    
  }
  GetFldCounts() {
    return this.settings.Columns.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.Data);
    
  }

  ClickActionEv(r, a) {
    this.ClickAction.emit({ data: r, action: a });
    return false;
  }
  FindTotal(fld) {
    if (this.Data) {
      return formatNumber(FindTotal(this.Data, fld), 'en', '1.2-2');
    }
  }
  ngOnDestroy(): void {}
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
  customChkboxOnSelect({ selected }) {
     console.log(selected);
     
  }
}
