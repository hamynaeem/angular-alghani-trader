import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements OnInit {
  @Input() form: any;
  @Input() formdata: any = {};

  @Output() DataSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() Cancelled: EventEmitter<any> = new EventEmitter<any>();
  @Output() Event: EventEmitter<any> = new EventEmitter<any>();



  constructor(private http: HttpBase,
    public bsModalRef: BsModalRef) { }

  ngOnInit() {
  //   this.form.columns.forEach((col) => {
  //     if (col.hasOwnProperty("listTable")) {
  //       this.http.getData(col.listTable).then((res: any) => {
  //         col.listData = res;
  //       });
  //     }
  //   });
  }
  Cancel() {

    this.Event.emit({ data: this.formdata , res:'cancel' });

  }
  Save() {

    this.Event.emit({ data: this.formdata , res:'save' });

  }
}
