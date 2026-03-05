import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpBase } from '../../../services/httpbase.service'
import {jsPDF} from 'jspdf';


@Component({
    selector: 'app-sale-order-print',
    templateUrl: './sale-order-print.component.html',
    styleUrls: ['./sale-order-print.component.scss']
})

export class SaleOrderPrintComponent implements OnInit {
  @ViewChild('Invoice') Invoice: ElementRef;

public OrderNo: any;
  public branch:any= {};
  SaleOrder: any;
constructor(private http: HttpBase,
  private activatedRoute: ActivatedRoute,
    ) {
}
ngOnInit(): void {
  this.activatedRoute.params.subscribe((params: Params) => {
    this.OrderNo = params.id;
    console.log(this.OrderNo);
    if (this.OrderNo) this.LoadData();
  });
  this.branch = this.http.geBranchData()
}
LoadData(): void {
  this.http.getData("getsaleorder/" + this.OrderNo).then((response:any) => {

  this.SaleOrder = response;

  });
}
Print() {
  window.print();
}

ExportPDF() {
  let pdf = new jsPDF('p','pt','a4');
  pdf.text('Hello World', 10,10);
  pdf.html(this.Invoice.nativeElement.innerHTML, {
    callback: (pdf)=>{
      pdf.save('invoice.pdf');
    }
  });

}
}
