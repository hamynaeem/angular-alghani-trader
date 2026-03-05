import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transports',
  templateUrl: './transports.component.html',
  styleUrls: ['./transports.component.scss']
})
export class TransportsComponent implements OnInit {
  // SQL query to create transports table:
  // CREATE TABLE transports (
  //   TransportID INT PRIMARY KEY AUTO_INCREMENT,
  //   TransportName VARCHAR(255) NOT NULL,
  //   VehicleNo VARCHAR(255) NOT NULL,
  //   DriverName VARCHAR(255)
  // );

  public form = {
    title: 'Transports',
    tableName: 'transports',
    pk: 'TransportID',
    columns: [
      {
        fldName: 'TransportName',
        control: 'input',
        type: 'text',
        label: 'Transport Name',
        required: true,
        size: 12
      },
      {
        fldName: 'VehicleNo',
        control: 'input',
        type: 'text',
        label: 'Vehicle No',
        required: true,
        size: 12
      },
      {
        fldName: 'DriverName',
        control: 'input',
        type: 'text',
        label: 'Driver Name',
        size: 12
      }
    ]
  };
  public list = {
    tableName: 'transports',
    pk: 'TransportID',
    columns: this.form.columns
  };
  constructor() { }

  ngOnInit() {
  }

}
