import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-salesman',
  templateUrl: './salesman.component.html',
  styleUrls: ['./salesman.component.scss']
})
export class SalesmanComponent implements OnInit {
  public form = {
    title: 'Salesman',
    tableName: 'salesman',
    pk: 'SalesmanID',
    columns: [
      {
        fldName: 'SalesmanName',
        control: 'input',
        type: 'text',
        label: 'Salesman Name',
        required: true,
        size: 12
      },
      {
        fldName: 'Address',
        control: 'input',
        type: 'text',
        label: 'Address',
        size: 12
      },
      {
        fldName: 'PhoneNo',
        control: 'input',
        type: 'text',
        label: 'Phone No', required: true,
        size: 6
      },
      {
        fldName: 'username',
        control: 'input',
        type: 'text',
        label: 'User Name', required: true,
        size: 6
      },
      {
        fldName: 'password',
        control: 'input',
        type: 'password',
        label: 'Password', required: true,
        size: 6
      },
      {
        fldName: 'Rights',
        control: 'select',
        type: 'list',
        label: 'Rights',
        listTable: 'usergroups',
        listdata: [],
        displayFld: 'GroupName',
        valueFld: 'GroupID',
        required: true,
        size: 6
      },
    ]
  };
  public list = {
    tableName: 'salesman',
    pk: 'SalesmanID',
    columns: [
      {
        data: 'SalesmanName',
        control: 'input',
        type: 'text',
        label: 'Salesman Name',
        required: true,
        size: 12
      },
      {
        data: 'Address',
        control: 'input',
        type: 'text',
        label: 'Address',
        size: 12
      },
      {
        data: 'PhoneNo',
        control: 'input',
        type: 'text',
        label: 'Phone No', required: true,
        size: 6
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
