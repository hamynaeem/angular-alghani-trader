import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ctrlaccts',
  templateUrl: './ctrlaccts.component.html',
  styleUrls: ['./ctrlaccts.component.scss']
})
export class CtrlAcctsComponent implements OnInit {
  public form = {
    title: 'Control Accounts',
    tableName: 'ctrlaccts',
    pk: 'ID',
    columns: [
      {
        fldName: "Description",
        control: "select",
        type: "list",
        label: "Description",
        listTable: "tbl_ctrlkeys",
        listData: [],
        displayFld: "CtrlKey",
        valueFld: "CtrlKey",

        size: 6,
      },
      {
        fldName: "AcctID",
        control: "select",
        type: "list",
        label: "Acount",
        listTable: "accts",
        listData: [],
        displayFld: "AcctName",
        valueFld: "AccountID",

        size: 6,
      },

    ]
  };
  public list = {
    tableName: 'qryctrlaccts',
    pk: 'ID',
    columns: [
      {
        fldName: "CtrlKey",
        label: "Description",
      },
      {
        fldName: "AccountName",
        label: "Account Name",
      },

    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
