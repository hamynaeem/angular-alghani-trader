import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
class Person {
  ProductID: number;
  ProductName: string;
  CompanyName: string;
}

class DataTablesResponse {
  data: any;
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: "app-expreport",
  templateUrl: "./expreport.component.html",
  styleUrls: ["./expreport.component.scss"],
})
export class ExpReportComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  persons: Person[];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const that = this;

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            "http://localhost/itc/index.php/apis/dt/qrystock/",
            dataTablesParameters,
            {}
          )
          .subscribe((resp) => {
            that.persons = resp.data;

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [
        { name: "ProductID" },
        { name: "ProductName" },
        { name: "CompanyName" },
      ],
    };
  }
}
