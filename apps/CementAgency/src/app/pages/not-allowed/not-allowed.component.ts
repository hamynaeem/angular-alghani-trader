import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpBase } from '../../services/httpbase.service';
import { ROUTES } from '../../shared/vertical-menu/vertical-menu-routes.config';


@Component({
  selector: 'app-notallowed',
  templateUrl: './not-allowed.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NotAllowedComponent implements OnInit {

  group_id = '';
  MenuItems: any = [];
  constructor(private http: HttpBase) {
  }

  ngOnInit() {

    this.MenuItems = this.MenuItems.concat (ROUTES.filter(x => {
      return (x.path.includes('account'))
    }));
     this.MenuItems = this.MenuItems.concat (ROUTES.filter(x => {
      return (x.path.includes('cash'))
    }));
     this.MenuItems = this.MenuItems.concat (ROUTES.filter(x => {
      return (x.path.includes('reports'))
    }));
  }

}
