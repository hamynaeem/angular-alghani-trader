import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-labourheads',
  templateUrl: './labourheads.component.html',
  styleUrls: ['./labourheads.component.scss']
})
export class LabourheadsComponent implements OnInit {
  public form = {
    title: 'Departaments',
    tableName: 'labourheads',
    pk: 'LabourHeadID',
    columns: [
      {
        fldName: 'LabourHead',
        data: 'LabourHead',
        control: 'input',
        type: 'text',
        label: 'Labour Head',
        required: true
      }
    ]
  };
  public list = {
    tableName: 'labourheads',
    pk: 'LabourHeadID',
    columns: this.form.columns
  };
  constructor() { }

  ngOnInit() {
  }

}
