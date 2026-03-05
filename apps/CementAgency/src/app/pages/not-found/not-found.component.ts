import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpBase } from '../../services/httpbase.service';


@Component({
  selector: 'app-notfound',
  templateUrl: './not-found.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NotFoundComponent implements OnInit {

  group_id = '';
  MenuItems: any = [];
  constructor(private http: HttpBase) {
  }

  ngOnInit() {


  }

}
