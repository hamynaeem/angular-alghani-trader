import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpBase } from '../../../services/httpbase.service';
import swal from 'sweetalert';

@Component({
  selector: 'app-companiesbysm',
  templateUrl: './companiesbysm.component.html',
  styleUrls: ['./companiesbysm.component.scss']
})
export class CompaniesBySalesman implements OnInit {
  @ViewChild("dataList") dataList;

  public form = {
    title: 'Companies By Salesman',
    tableName: 'smcompanies',
    pk: 'ID',
    columns: [
{
        fldName: 'SalesmanID',
        control: 'select',
        type: 'lookup',
        label: 'Salesman',
        listTable: 'salesman',
        listdata: [],
        displayFld: 'SalesmanName',
        valueFld: 'SalesmanID',
        required: true,
        size: 4
      },
      {
        fldName: 'CompanyID',
        control: 'select',
        type: 'lookup',
        label: 'Company',
        listTable: 'companies',
        listdata: [],
        displayFld: 'CompanyName',
        valueFld: 'CompanyID',
        required: true,
        size: 4
      },


    ]
  };
  public Settings = {
    tableName: 'qrysmcompanies',
    pk: 'ID',
    crud: true,

    columns: [
      { data: 'ID', label: 'ID', },
      { data: 'SalesmanName', label: 'Salesman' },
      { data: 'CompanyName', label: 'Company' },

    ],
    actions: [
      { action: 'edit', title: 'Edit', icon: 'pencil', class: 'primary' },
      { action: 'delete', title: 'Delete', icon: 'trash', class: 'danger' },
    ]
  };
  public Filter = {
    SalesmanID: '',

  };
  salesman: any = [];


  constructor(
    private http: HttpBase,
  ) { }

  ngOnInit() {

    this.http.getData("salesman").then(a => {
      this.salesman = a;
    })

  }


  FilterData() {
    let filter = "1 = 1 "
    if (this.Filter.SalesmanID !== '')
      filter += " AND SalesmanID=" + this.Filter.SalesmanID;



    this.dataList.FilterTable(filter);


  }
  Clicked(e) {
    console.log(e);

    if (e.action === 'edit') {
      this.http.getData('smcompanies/' + e.data.ID).then((r: any) => {
        this.Add(r);
      })


    } else if (e.action === 'delete') {
      swal({
        text: `Do you really want to delete this product ${e.data.ProductName}  ?`,
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: true,
        },
      })
        .then(willDelete => {
          if (willDelete) {
            this.http.Delete('smcompanies', e.data.ID).then(r => {
              this.FilterData();
              swal('Deleted!', 'Your product is deleted', 'success');

            }).catch(er => {
              swal('Error!', 'Error whie deleting', 'error');
            });

          }
        });
    }

  }
  Add(data: any = {}) {
    this.http.openForm(this.form, data).then((r) => {
      if (r == 'save') {
        this.dataList.realoadTable();
        console.log(r);
      }
    });
  }
}
