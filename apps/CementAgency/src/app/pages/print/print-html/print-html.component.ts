import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { PrintDataService } from '../../../services/print.data.services';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from '../../../../environments/environment';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-print-html',
  templateUrl: './print-html.component.html',
  styleUrls: ['./print-html.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrintHtmlComponent implements OnInit, AfterViewInit {
  public printdata: any;
  Business: any = {};
  IMAGE_URL = environment.UPLOADS_URL;

  constructor(private pdata: PrintDataService, private http: HttpBase) {}

  ngOnInit() {
    this.printdata = this.pdata.PrintData;
    this.http.getData('business/' + this.http.getBusinessID()).then((d) => {
      this.Business = d;
    });
  }
  ngAfterViewInit() {
    if (this.printdata.HTMLData) {
      document.getElementById('main')?.append(this.printdata.HTMLData);
    }
    document.body.classList.add('A4');
  }
  getValue(r, c) {
    return r[c];
  }

  Print() {
    window.print();
  }
  Export() {
    const doc = new jsPDF('p', 'mm', 'A4');

    $('.table .table-dyna tr').find('th:last-child, td:last-child').remove();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(this.Business.BusinessName, 105, 10, {
      align: 'center',
    });
    doc.setFontSize(11);
    doc.text(this.Business.Address + ', ' + this.Business.City, 105, 15, {
      align: 'center',
    });
    doc.text('Tel: ' + this.Business.Phone, 105, 20, {
      align: 'center',
    });

    doc.setFontSize(16);
    doc.text(this.pdata.PrintData.Title, 105, 27, {
      align: 'center',
    });

    doc.setFontSize(11);
    doc.text(this.pdata.PrintData.SubTitle, 105, 32, {
      align: 'center',
    });
    let tableY = 37;
    if (this.pdata.PrintData.Title == 'Customer Accounts Report') {
      doc.setFontSize(14);
      doc.text(this.pdata.PrintData.CustomerName, 105, 37, {
        align: 'center',
      });
      tableY += 5;
    }
    doc.setFontSize(8);
    autoTable(doc, {
      html: '.table .table-dyna',
      theme: 'grid',
      startY: tableY,
      styles: { overflow: 'linebreak', fontSize: 8 },
      margin: {
        left: 5,
        right: 5,
      },
    });

    doc.save(this.pdata.PrintData.Title);
  }
}
