import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-customer-acctdetails',
  templateUrl: './customer-acctdetails.component.html',
  styleUrls: ['./customer-acctdetails.component.scss'],
})
export class CustomerAcctdetailsComponent implements OnInit, OnChanges {
  @Input('FromDate') FromDate: '';
  @Input('ToDate') ToDate: '';
  @Input('CustomerID') CustomerID: '';
  @Input('bid') bid = 0;

  public data: any = [];
  public Products: object[];
  public Users: object[];

  customer: any = {};

  constructor(private http: HttpBase,
    private activatedRoute: ActivatedRoute,
    private ps: PrintDataService,
    private router: Router,

  ) {}

  ngOnInit() {

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.dte1) {
        this.FromDate = params.dte1;
        this.ToDate = params.dte2;
        this.CustomerID = params.id;
        this.http.getData('customers/' +this.CustomerID ).then (r=>{
          this.customer = r;
        })
        this.FilterData();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {

    console.log(changes);

    if (changes.CustomerID.previousValue != changes.CustomerID.currentValue) {
      this.FilterData();
    }
  }
  FilterData() {
    if (this.CustomerID == '') return
    this.http
      .getData(
        `customeracctdetails/${(this.FromDate)}/${(
          this.ToDate
        )}/${this.CustomerID}`
      )
      .then((r: any) => {
        this.data = r;
        if (this.data.length > 0) {
          this.customer.OpenBalance =
            (this.data[0].Balance - this.data[0].Debit) * 1 +
            this.data[0].Credit * 1;
          this.customer.CloseBalance = this.data[this.data.length - 1].Balance;

          this.data.unshift({
            Date: this.data[0].Date,
            Description: 'Opeing Balance ...',
            Debit: 0,
            Credit: 0,
            Balance: this.customer.OpenBalance,
          });
          console.log(this.data);
        }
      });
  }
  formatDate(d) {
    return JSON2Date(d);
  }
  PrintReport() {

    this.ps.PrintData.Title = "Customer Accounts Report"
    this.ps.PrintData.SubTitle = "From: " + (this.FromDate)
    this.ps.PrintData.SubTitle += " To: " + (this.ToDate)
    this.ps.PrintData.CustomerName = "Customer: " + this.customer.CustomerName;

    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.router.navigateByUrl('/print/print-html');
  }
}
