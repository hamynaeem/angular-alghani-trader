import { Component, forwardRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessorBase } from '../multi-col-combobox/value-accessor';
import { HttpBase } from '../services/httpbase.service';

@Component({
  selector: 'ft-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StoresComponent),
    multi: true
  }]
})
export class StoresComponent extends ValueAccessorBase<string> implements OnInit {
  @ViewChild('dataList') dataList;

  @Input() caption: any = '';
  @Input() addlabel: any = true;

  Stores = [];

  constructor(
    private http: HttpBase,
    injector: Injector
  ) {
    super(injector);
  }


  ngOnInit() {
    this.http.getData('stores').then((r: any) => {
      this.Stores = r;
    });
  }
  setDisabledState?() {

  }
}
