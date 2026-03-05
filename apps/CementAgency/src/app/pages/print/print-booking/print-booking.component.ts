import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import * as JSPDF from 'jspdf';
import * as moment from 'moment';
import { ToWords } from 'to-words';
import { environment } from '../../../../environments/environment';
import { months } from '../../../factories/constants';
import { FindTotal, RoundTo, getDMYDate } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-print-booking',
  templateUrl: './print-booking.component.html',
  styleUrls: ['./print-booking.component.scss'],
})
export class PrintBookingComponent
  implements OnInit, OnChanges, AfterViewInit
{
  public Invoice: any = {
    Purchase: [],
    Sale: []
  };

  @Input() InvoiceID = '';

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
      console.log(this.Business);

      $('#notes').html(this.Business.Notes);
    });
    this.route.paramMap.subscribe((params) => {
      let InvoiceID = params.get('id');
      
      this.http
        .getData('qrybooking?filter=BookingID=' + InvoiceID)
        .then((inv: any) => {
          this.Invoice = inv[0];
         
          this.http
            .getData('qrybookingpurchase?filter=BookingID=' + InvoiceID)
            .then((r: any) => {
              let k = 0;
             
              console.log(r);
              this.Invoice.Purchase = r;
              this.ref.markForCheck();
            });
          this.http
            .getData('qrybookingsale?filter=BookingID=' + InvoiceID)
            .then((r: any) => {
              let k = 0;
             
              console.log(r);
              this.Invoice.Sale = r;
              this.ref.markForCheck();
            });
        });
    });
  }
  ngOnChanges() {}
  FindTotal(fld: string) {
    if (this.Invoice.Purchase) {
      return this.RoundIt(FindTotal(this.Invoice.Purchase, fld), 0);
    } else {
      return 0;
    }
  }

  ngAfterViewInit() {
    //document.getElementById('preloader')?.classList.add('hide');
    document.body.classList.add('A4');


    // document.body.classList.remove('A4');

    // setTimeout(() => {
    //   this.Print();
    // }, 2000);
  }

  Print() {
   window.print();

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

  getDMYDate(d: any) {
    return getDMYDate(new Date(d));
  }
  RoundIt(dgt: number, dec: number) {
    return RoundTo(dgt, dec);
  }
  FormatDate(date: string) {
    return moment(date).format('DD-MM-YYYY')
  }
  FormatInvNo(inv: string) {
    if (!inv) return;
    const m = inv.substring(2, 4);
    return inv.slice(0, 2) + months[Number(m) - 1].Month + inv.slice(4);
  }
  FindWieght(w: number  ) {
    let mon = Math.floor(w / 40);
    let kg = w % 40;
    return `${mon}-${kg}`;
  }

  RoundTo(n: number, d: number)
  {
    return RoundTo(n,d);
  }
  getPurchaseTotalQty(): number {
    if (!this.Invoice.Purchase) return 0;
    return FindTotal(this.Invoice.Purchase, 'Qty');
  }

  getPurchaseTotalAmount(): number {
    if (!this.Invoice.Purchase) return 0;
    return FindTotal(this.Invoice.Purchase, 'Amount');
  }

  getSaleTotalQty(): number {
    if (!this.Invoice.Sale) return 0;
    return FindTotal(this.Invoice.Sale, 'Qty')/ 20;
  }

  getSaleTotalAmount(): number {
    if (!this.Invoice.Sale) return 0;
    return FindTotal(this.Invoice.Sale, 'Amount');
  }
  getSaleTotalDiscount() : number {
    if (!this.Invoice.Sale) return 0;
    return FindTotal(this.Invoice.Sale, 'Discount');
  }
}
