import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {
  public form = {
    title: 'Route',
    tableName: 'routes',
    pk: 'RouteID',
    columns: [
      {
        fldName: 'RouteName',
        data: 'RouteName',
        control: 'input',
        type: 'text',
        label: 'Route Name',
        required: true
      }
    ]
  };

  constructor() { }

  ngOnInit() {
  }

}
