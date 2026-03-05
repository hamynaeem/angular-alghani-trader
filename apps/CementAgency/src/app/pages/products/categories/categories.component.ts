import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  constructor() { }
  public form = {
    title: 'Categories',
    tableName: 'categories',
    pk: 'CatID',
    columns: [
      {
        fldName: 'CatName',
        data: 'CatName',
        control: 'input',
        type: 'text',
        label: 'Category Name',
        required: true
      }
    ]
  };
  public list = this.form;
  ngOnInit() {
  }

}
