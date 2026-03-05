import { Component, EventEmitter, forwardRef, Injector, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Query } from '@syncfusion/ej2-data';
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
  @Input('dataSource') public Data:any = [];
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
      let query = new Query();
      // frame the query based on search string with filter type.
      query =
        e.text !== ''
          ? query.search(e.text)
          : query;
      filtered = this.Data.filter(x => {
        let idx = -1;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.Cols.length; i++) {
          // console.log(e.text, x[this.Cols[i].fldName]);
          if (x[this.Cols[i].fldName] == null|| e.text == null )
            break;
          idx = x[this.Cols[i].fldName].toUpperCase().indexOf(e.text.toUpperCase());
          if (idx >= 0) {

            break;
          }
        }

        return idx >= 0;
      });
     // console.log(filtered);
      // pass the filter data source, filter query to updateData method.
      // console.log(filtered.slice(0,100));
      e.updateData(filtered);
    }
  }
  // public onFiltering = (e: FilteringEventArgs) => {
  //   let filtered;
  //   if (e.text === '') {
  //     e.updateData(this.Data);
  //     this.Data = [...this.Data];
  //   } else {
  //     let query = new Query();
  //     // frame the query based on search string with filter type.
  //     query =
  //       e.text !== ''
  //         ? query.search(e.text)
  //         : query;
  //     filtered = this.Data.filter(x => {
  //       let idx = -1;
  //       // tslint:disable-next-line:prefer-for-of
  //       for (let i = 0; i < this.Cols.length; i++) {
  //         idx = x[this.Cols[i].fldName].toUpperCase().indexOf(e.text.toUpperCase());
  //         if (idx >= 0) {

  //           return true;
  //         }
  //       }

  //       return idx >= 0;
  //     });
  //     console.log(filtered);
  //     // pass the filter data source, filter query to updateData method.
  //     e.updateData(filtered);
  //   }
  // }
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
