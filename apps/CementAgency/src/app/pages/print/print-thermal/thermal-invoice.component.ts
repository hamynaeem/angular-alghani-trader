import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation
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
  selector: 'app-thermal-invoice',
  templateUrl: './thermal-invoice.component.html',
  styleUrls: ['./thermal-invoice.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ThermalInvoiceComponent
  implements OnInit, OnChanges, AfterViewInit
{
  public Invoice: any = {
    Detail: [],
  };

  @Input() InvoiceID = '';
  // public Invoice: any = {};

  IMAGE_URL = environment.UPLOADS_URL;
  signSrc = './../../../assets/img/sign.jpg';
  extra: any = [];
  company: any = {};
  Business: any = {};
  k = 1;
  Notes: string[] = [];

  constructor(
    private http: HttpBase,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.http.getData('business/' + this.http.getBusinessID()).then((d) => {
      this.Business = d;
      // $('#notes').html(this.Business.Notes);
      console.log(this.Business.Notes);
      this.Notes = [... this.Business.Notes.matchAll(/<p[^>]*>(.*?)<\/p>/gi)] ;
      console.log(this.Notes);
//-------------------------------------
let data = `<p>
جھاڑو سوکھتا ہے۔ وزن میں کمی ہوتی ہے۔ ہم پورا وزن کرتے ہیں بعد میں کمی بیشی ہو سکتی ہے۔
</p>
<p>
بھول چوک لین دین
</p> `;

// Use regex to match content inside <p>...</p> tags
let matches = [...this.Business.Notes.matchAll(/<p[^>]*>(.*?)<\/p>/gis)];

// Extract and clean the text content
this.Notes = matches.map(match => match[1].trim());

console.log(this.Notes);
//-------------------------------------




    });
    this.route.paramMap.subscribe((params) => {
      let InvoiceID = params.get('id');
      if (this.InvoiceID != '') InvoiceID = this.InvoiceID;

      this.http
        .getData('qryinvoices?filter=Invoiceid=' + InvoiceID)
        .then((inv: any) => {
          this.Invoice = inv[0];
          this.Invoice.BalanceInWords = new ToWords().convert(
            this.Invoice.NetAmount
          );
          this.http
            .getData('qryinvoicedetails?filter=InvoiceID=' + InvoiceID)
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
    });
  }
  ngOnChanges() {}
  FindTotal(fld, d = 0) {
    if (this.Invoice.Detail) {
      return this.RoundIt(FindTotal(this.Invoice.Detail, fld), d);
    } else {
      return 0;
    }
  }

  ngAfterViewInit() {
    //document.getElementById('preloader')?.classList.add('hide');

    // $('#notes').html(this.Business.Notes);
    setTimeout(() => {
      window.print();
      //  this.bsModalRef.hide();
    }, 3000);
  }

  Print() {
    window.print();
    window.close();
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
    return moment(date).format('DD-MM-YYYY');
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

  RoundTo(n, d) {
    return RoundTo(n, d);
  }
}
