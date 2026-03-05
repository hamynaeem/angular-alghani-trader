import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-units',
  templateUrl: './expensehead.component.html',
  styleUrls: ['./expensehead.component.scss']
})
export class ExpenseheadComponent implements OnInit {
  public form = {
    title: 'Expense Head',
    tableName: 'expenseheads',
    pk: 'HeadID',
    columns: [
      {
        data: 'Head',
        fldName: 'Head',
        control: 'input',
        type: 'text',
        label: 'Head Name',
        required: true
      }
    ]
  };
  public list = {
    tableName: 'expenseheads',
    pk: 'HeadID',
    columns: this.form.columns
  };
  constructor() { }

  ngOnInit() {
  }

}
