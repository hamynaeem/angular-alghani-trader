import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deps',
  templateUrl: './depts.component.html',
  styleUrls: ['./depts.component.scss']
})
export class DeptsComponent implements OnInit {
  public form = {
    title: 'Departaments',
    tableName: 'depts',
    pk: 'dept_id',
    columns: [
      {
        fldName: 'dept_name',
        control: 'input',
        type: 'text',
        label: 'Department Name',
        required: true
      }
    ]
  };
  public list = {
    tableName: 'depts',
    pk: 'dept_id',
    columns: this.form.columns
  };
  constructor() { }

  ngOnInit() {
  }

}
