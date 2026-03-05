import { Component, Input, Output, EventEmitter, forwardRef, Injector, ViewChild, OnInit } from '@angular/core';
import { FilteringEventArgs, ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { ValueAccessorBase } from './value-accessor';

@Component({
  selector: 'ft-multi-col-combobox',
  templateUrl: './multi-col-combobox.component.html',
  styleUrls: ['./multi-col-combobox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiColComboboxComponent),
    multi: true
  }]
})

export class MultiColComboboxComponent extends ValueAccessorBase<string> {
  @ViewChild(NgModel) model: NgModel;
  @ViewChild('cmbMulti')
  public cmbMulti: ComboBoxComponent;
  // tslint:disable-next-line:no-input-rename
  @Input('dataSource') public Data: any = [];
  @Input() public fields: any;
  // @Input() public value: any;
  @Input() public Cols: ColSettings[] = [];
  @Output() Change: EventEmitter<any> = new EventEmitter<any>();
  public pData = []
  public isDisabled = false;
  ngModelChange: any;

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  setDisabledState?() {

  }
  public onFiltering = (e: FilteringEventArgs) => {
    let filtered;

    //console.log(e.text);

    if (e.text == '' || e.text == null) {
      e.updateData(this.pData);

    } else {

      filtered = this.Data.filter(x => {
        let idx = -1;

        for (let i = 0; i < this.Cols.length; i++) {

          if (x[this.Cols[i].fldName] == null || e.text == null)
            break;
          idx = x[this.Cols[i].fldName].toUpperCase().indexOf(e.text.toUpperCase());
          if (idx >= 0) {

            break;
          }
        }

        return idx >= 0;
      });

      e.updateData(filtered);
    }
  }
  public get text() {
    return this.cmbMulti.text;
  }
  public set test(v) {
    this.cmbMulti.text = v;
  }
  Selected(event) {
    this.Change.emit(event);

  }
  public focusIn() {
    this.cmbMulti.focusIn();
  }
}
export class ColSettings {
  title: string;
  fldName: string;
  size: number;
}
