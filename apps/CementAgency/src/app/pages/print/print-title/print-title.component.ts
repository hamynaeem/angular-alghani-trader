import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-print-title',
  templateUrl: './print-title.component.html',
  styleUrls: ['./print-title.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrintTitleComponent implements OnInit, AfterViewInit {

  IMAGE_URL = environment.UPLOADS_URL;
  public printdata: any;
  @Input()
  Business: any = {};

  constructor(
    private http: HttpBase) {

  }

  ngOnInit() {

  }
  ngAfterViewInit() {

       document.body.classList.add('A4');
  }
  getValue(r, c) {
    return r[c];
  }
}
