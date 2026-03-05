import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-crud-list',
  templateUrl: './crud-list.component.html',
  styleUrls: ['./crud-list.component.scss']
})
export class CrudListComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('List') list: any;
  // tslint:disable-next-line:no-input-rename
  @Input('Data') data = [];
  @Output() AddClicked = new EventEmitter();
  @Output() EditClicked = new EventEmitter();
  @Output() DeleteClicked = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
  Add(idx = 0) {
    this.AddClicked.emit({ idx: -1, obj: null });
  }
  public Delete(obj) {

    this.DeleteClicked.emit(obj);

  }
  public Edit(obj) {
    this.EditClicked.emit(obj);


  }
}
