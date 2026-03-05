import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import * as JSPDF from 'jspdf';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { months } from '../../../factories/constants';
import { FindTotal, RoundTo, getDMYDate } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-print-gatepass',
  templateUrl: './print-gatepass.component.html',
  styleUrls: ['./print-gatepass.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrintGatepassComponent
  implements OnInit, OnChanges, AfterViewInit
{
  public Invoice: any = {
    Detail: [],
  };

  @Input() InvoiceID:any = '';
  @Input() StoreID:any = '';

  // public Invoice: any = {};

  IMAGE_URL = environment.UPLOADS_URL;
  signSrc = './../../../assets/img/sign.jpg';
  extra: any = [];
  company: any = {};
  Business: any = {};
  k = 1;

  constructor(
    private http: HttpBase,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.http.getData('business/' + this.http.getBusinessID()).then((d) => {
      this.Business = d;

      console.log('invoiceID=' + this.InvoiceID);
      console.log('StoreID=' + this.StoreID);

      this.route.paramMap.subscribe((params) => {
        this.InvoiceID = params.get('id');
        this.StoreID = params.get('storeID');

      this.LoadData()
      });
    });

    this.ref.markForCheck();


  }
  LoadData(){
    console.log(this.InvoiceID, this.StoreID);

    if (this.InvoiceID == '') return;
    this.http
    .getData(`getgatepass/${this.InvoiceID}/${this.StoreID}`)
    .then((inv: any) => {
      this.Invoice = inv[0];

      this.http
        .getData(
          'qryinvoicedetails?orderby=DetailID DESC&filter=InvoiceID=' +
            this.InvoiceID +
            ' and StoreID =' +
            this.StoreID
        )
        .then((r: any) => {
          let k = 0;
          r.forEach((e) => {
            e.Sno = ++k;
          });
          console.log(r);
          this.Invoice.Detail = r;
          this.ref.markForCheck();
        });
    });
  }
  ngOnChanges() {}
  FindTotal(fld) {
    if (this.Invoice.Detail) {
      return this.RoundIt(FindTotal(this.Invoice.Detail, fld), 0);
    } else {
      return 0;
    }
  }

  ngAfterViewInit() {
    //document.getElementById('preloader')?.classList.add('hide');
    document.body.classList.add('A4');

    setTimeout(() => {
      this.Print();
    }, 2000);
  }

  Print() {
   window.print();
  //  window.close();
  }

  SaveAsPdf() {
    const data: any = document.getElementById('print-section');
    html2canvas(data).then((canvas) => {
      // Few necessary setting options
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new JSPDF.jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save(
        this.Invoice.CustomerName + '-' + this.Invoice.InvoiceID + '.pdf'
      ); // Generated PDF
    });
  }

  getDMYDate(d) {
    return getDMYDate(new Date(d));
  }
  RoundIt(dgt, dec) {
    return RoundTo(dgt, dec);
  }
  FormatDate(date) {
    return moment(date).format('DD-MM-YYYY')
  }
  FormatInvNo(inv: string) {
    if (!inv) return;
    const m = inv.substring(2, 4);
    return inv.slice(0, 2) + months[Number(m) - 1].Month + inv.slice(4);
  }
  FindWieght(w) {
    let mon = Math.floor(w / 40);
    let kg = w % 40;
    return `${mon}-${kg}`;
  }

  RoundTo(n, d)
  {
    return RoundTo(n,d);
  }
}
