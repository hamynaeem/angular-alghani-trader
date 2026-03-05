import { Component, OnInit } from '@angular/core';
import { OrdersListSettings } from './saleorder.settings';

@Component({
  selector: 'app-sale-order-report',
  templateUrl: './saleorders.component.html',
  styleUrls: ['./saleorders.component.scss']
})
export class saleordersReportComponent implements OnInit {

 public list = OrdersListSettings
  constructor() { }

  ngOnInit() {
  }

}
