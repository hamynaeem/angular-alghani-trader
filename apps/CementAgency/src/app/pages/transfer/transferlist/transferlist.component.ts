import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpBase } from './../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetDateJSON } from '../../../factories/utilities';


@Component({
  selector: 'app-transferlist',
  templateUrl: './transferlist.component.html',
  styleUrls: ['./transferlist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransferlistComponent implements OnInit {
  @ViewChild('DetailModel') DetailModel: ModalDirective;
  public data: any = [];
  public detaildata: any = [];
  CustomerID = '';
  public customerinfo: any = [];
  public customerfields: Object = { text: 'CustomerName', value: 'CustomerID' };
  public Typeinfo: any = [];
  public Typefields: Object = { text: 'AcctType', value: 'AcctTypeID' };
  public dteFilter = {
    dteFrom: GetDateJSON(),
    dteTo: GetDateJSON()
  };


  public settings = {
    selectMode: 'single',  // single|multi
    hideHeader: false,
    hideSubHeader: false,
    mode: 'external',
    actions: {
      columnTitle: 'Actions',
      add: false,
      edit: true,
      delete: false,
      position: 'right', // left|right
      custom: [
        {
          name: 'post',
          title: '<i class="fa fa-check mr-3 text-danger" title="Post Transfer"></i>'
        },

      ],
    },
    edit: {
      editButtonContent: '<i class="fa fa-pencil mr-3 text-primary"></i>',
      saveButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',
      confirmSave: true
    },
    add: {
      addButtonContent: '<h4 class="mb-1"><i class="fa fa-plus ml-3 text-success"></i></h4>',
      createButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',

    },
    delete: {
      deleteButtonContent: '<i class="fa fa-trash-o text-danger"></i>',
      confirmDelete: true
    },
    noDataMessage: 'No data found',
    columns: {
      TransferID: {
        title: 'TNo',
        editable: false,
        width: '60px',
        type: 'html',
        valuePrepareFunction: (value) => '<div class="text-center">' + value + '</div>'
      },

      Date: {
        title: 'Date',
        filter: true

      },
      From: {
        title: 'From Store',
        type: 'string'
      },
      To: {
        title: 'To Store',
        type: 'string'
      },
      Status: {
        title: 'Status',
        type: 'string'
      },

    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  public user: any = 0;
  date1 = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };


  public settings1 = {
    selectMode: 'single',  // single|multi
    hideHeader: false,
    hideSubHeader: false,
    mode: 'external',
    actions: {
      columnTitle: 'Actions',
      add: false,
      edit: false,
      delete: false,
      position: 'right' // left|right
    },
    edit: {
      editButtonContent: '<i class="fa fa-pencil mr-3 text-primary"></i>',
      saveButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',
      confirmSave: true
    },
    add: {
      addButtonContent: '<h4 class="mb-1"><i class="fa fa-plus ml-3 text-success"></i></h4>',
      createButtonContent: '<i class="fa fa-check mr-3 text-success"></i>',
      cancelButtonContent: '<i class="fa fa-times text-danger"></i>',

    },
    delete: {
      deleteButtonContent: '<i class="fa fa-trash-o text-danger"></i>',
      confirmDelete: true
    },
    noDataMessage: 'No data found',
    columns: {
      DetailID: {
        title: 'ID',
        editable: false,
        width: '60px',
        type: 'html',
        filter: 'false',

        valuePrepareFunction: (value) => '<div class="text-center">' + value + '</div>'
      },
      ProductName: {
        title: 'Product Name',
        filter: false,
        type: 'string'
      }, Qty: {
        title: 'Qty',
        filter: 'false',
        type: 'string'
      }
    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  constructor(
    private http: HttpBase,
    private router: Router,
    private myToaster: MyToastService,) { }
  ngOnInit() {
    this.LoadData();
    this.http.getData('accttypes').then(res => {
      this.Typeinfo = res;
    });

  }

  public LoadData() {

    this.data = [];

    this.http.getData('qrystocktransfer?filter=Date between "' +
      this.getDate(this.dteFilter.dteFrom) + '" and "' +
      this.getDate(this.dteFilter.dteTo) + '"').then((res: any) => {
        res = res.map(m=>{
          m.Status = m.IsPosted=='0'? 'Un Posted': 'Posted';
          return m;
        })
        console.log(res);
        this.data = res;
      })
  }

  getDate(dte: any) {
    return dte.year + '-' + dte.month + '-' + dte.day;
  }

  onCustom(event) {
    console.log(event);
    if (event.action) {
      if (event.action == 'post') {
        if (event.data.IsPosted =='0'){
        this.http.postTask('posttransfer/' + event.data.TransferID, {}).then((r:any)=>{
          this.LoadData();
          this.myToaster.Sucess(r.msg, 'Posted');
        }).catch(er=>{
           this.myToaster.Error(er.error.message, 'Error');
        });
      } else {
         this.myToaster.Error('Transfer is already posted', 'Error');
      }

      }
    } else {

      this.http.getData('qrystocktransferdetails?filter=TransferID=' + event.data.TransferID).then((res:any) => {


        this.detaildata = res;
      })
    }
  }
  public onEdit(event) {
    console.log(event.data);
    if (event.data.IsPosted != '1') {
      this.router.navigateByUrl('/transfer/transferitems/' + event.data.TransferID);

    } else {
      this.myToaster.Warning('', 'Not Editable');
    }

  }
}
