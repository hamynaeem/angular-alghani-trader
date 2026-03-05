import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements OnInit {
  @Input("Form") form: any;
  @Input("formdata") formdata: any = {};
  @Input("CrudButtons") CrudButtons: any = true;

  @Output() DataSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() Cancelled: EventEmitter<any> = new EventEmitter<any>();
  @Output() Event: EventEmitter<any> = new EventEmitter<any>();



  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {

  }
  Cancel() {

    this.Event.emit({ data: this.formdata , res:'cancel' });

  }
  Save() {
    this.Event.emit({ data: this.formdata , res:'save' });
  }
}
