import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ft-crud-list',
  templateUrl: './crud-list.component.html',
  styleUrls: ['./crud-list.component.scss'],
})
export class CrudListComponent implements OnInit {
  @Input('List') list: any;
  @Input('Data') data = [];
  @Input() Actions = ['edit', 'add', 'delete'];
  @Output() AddClicked = new EventEmitter();
  @Output() EditClicked = new EventEmitter();
  @Output() DeleteClicked = new EventEmitter();

  settings: any = {
    Columns: [],
    Actions: [],
    SubTable: null,
    Checkbox: false,
    crud: true,
    ButtonsAtRight: false,
  };

  constructor() {}

  ngOnInit() {
    this.list.columns.forEach((col) => {
      this.settings.Columns.push({ label: col.label, fldName: col.fldName });
    });
    if (this.Actions.includes('edit')) {
      this.settings.Actions.push({
        action: 'edit',
        title: 'Edit',
        icon: 'pencil',
        class: 'primary',
      });
    }
    if (this.Actions.includes('delete')) {
      this.settings.Actions.push({
        action: 'delete',
        title: 'Delete',
        icon: 'trash',
        class: 'danger',
      });
    }
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

  Clicked(e) {
    if (e.action === 'edit') {
      this.Edit(e.data);
    } else if (e.action === 'delete') {
      this.Delete(e.data);
    }
  }
}
