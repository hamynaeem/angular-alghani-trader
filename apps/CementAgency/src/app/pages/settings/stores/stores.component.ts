import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
  public form = {
    title: 'Departaments',
    tableName: 'stores',
    pk: 'StoreID',
    columns: [
      {
        fldName: 'StoreName',
        control: 'input',
        type: 'text',
        label: 'Store Name',
        required: true
      }
    ]
  };
  public list = {
    tableName: 'stores',
    pk: 'StoreID',
    columns: this.form.columns
  };
  constructor() { }

  ngOnInit() {
  }

}
