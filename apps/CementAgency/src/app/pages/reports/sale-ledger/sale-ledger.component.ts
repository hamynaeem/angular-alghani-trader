import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-sale-ledger',
  templateUrl: './sale-ledger.component.html',
  styleUrls: ['./sale-ledger.component.scss'],
})
export class SaleLedgerComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    ItemID: '',

    CustomerID: '',
  };
  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Booking No',
        fldName: 'BookingID',
      },
      {
        label: 'Customer Name',
        fldName: 'CustomerName',
      },
      {
        label: 'Product Name',
        fldName: 'ProductName',
      },
      {
        label: 'Qty',
        fldName: 'Qty',
        sum: true,
      },
      {
        label: 'Price',
        fldName: 'SPrice',
      },
      {
        label: 'Amount',
        fldName: 'Amount',
        sum: true,
      },
    ],
    Actions: [],
    Data: [],
  };

  nWhat = '1';
  Items: any = [{ ItemID: '1', ItemName: 'Test Item' }];

  public data: object[];
  public Accounts: any;
  public AccountsList: any[] = [];
  public selectedCustomer: any = {};
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router
  ) {
    this.Accounts = this.cachedData.Accounts$;
  }

  ngOnInit() {
    this.LoadItems();
    this.cachedData.Accounts$.subscribe((a: any[]) => {
      this.AccountsList = a || [];
      if (this.Filter.CustomerID && this.Filter.CustomerID !== '') {
        this.resolveSelectedCustomer(this.Filter.CustomerID);
      }
    });

    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title =
      'Sale Ledger ' +
      (this.Filter.CustomerID
        ? ' Customer: ' + this.selectedCustomer.CustomerName
        : '');
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  CustomerSelected(e) {
    const id = e && e.CustomerID ? e.CustomerID : e;
    this.resolveSelectedCustomer(id);
  }

  resolveSelectedCustomer(id: any) {
    if (!id) {
      this.selectedCustomer = {};
      return;
    }
    const c = this.AccountsList.find((x: any) => x.CustomerID == id);
    this.selectedCustomer = c || { CustomerID: id };
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (this.Filter.CustomerID)
      filter += ' and CustomerID=' + this.Filter.CustomerID;



    let flds =
      'Date,BookingID, CustomerName, ProductName, Qty, SPrice, Amount';

    this.http
      .getData(
        `qrysalereport?orderby=Date,BookingID&flds=${flds}&filter=${encodeURIComponent(filter)}`
      )
      .then((r: any) => {
        this.data = r;
      });
  }
  Clicked(e) {}

  ItemSelected(e) {}
  ItemChange(e) {
    this.LoadItems();
  }
  async LoadItems() {
    this.Items = [];
    if (this.nWhat == '1') {
      this.cachedData.Products$.subscribe((r: any) => {
        r.forEach((m) => {
          this.Items.push({
            ItemID: m.ProductID,
            ItemName: m.ProductName,
          });
        });
        this.Items = [...this.Items];
        console.log(this.Items);
      });
    } else if (this.nWhat == '2') {
      this.http.getData('units').then((r: any) => {
        r.forEach((m) => {
          this.Items.push({
            ItemID: m.ID,
            ItemName: m.UnitName,
          });
          this.Items = [...this.Items];
        });
      });
    }
  }
}
