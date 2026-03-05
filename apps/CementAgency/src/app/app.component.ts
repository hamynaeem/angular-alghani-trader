import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ROUTES } from './shared/vertical-menu/vertical-menu-routes.config';
import { RouteInfo } from './shared/vertical-menu/vertical-menu.metadata';
import { HttpBase } from './services/httpbase.service';
import { AppName } from './config/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  public routes: RouteInfo[] = ROUTES;

  constructor(private router: Router,
    private http: HttpBase,
    private activatedRoute: ActivatedRoute,
    private titleService: Title) {}

  ngOnInit() {



    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    )
    .subscribe(() => {

      var rt = this.getChild(this.activatedRoute)

      rt.data.subscribe(data => {
        this.titleService.setTitle( AppName + " :: " + data.breadcrumb)})
    })

    this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => window.scrollTo(0, 0));
  }
  getChild(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
