import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { HttpBase } from '../services/httpbase.service';
import { NavigationService } from '../services/navigation.service';
import { ROUTES } from '../shared/vertical-menu/vertical-menu-routes.config';
import { RouteInfo } from '../shared/vertical-menu/vertical-menu.metadata';


@Injectable()
export class AuthGuard implements CanActivate {
  routes = ROUTES

  constructor(private router: Router,
    private http: HttpBase,
    private navigation: NavigationService,
    private jwtHelp: JwtHelperService) {
      // this.navigation.getFilteredRoutes(this.http.getUserGroup()).subscribe(r=>{
      //   this.routes = r;
      // })
    }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    console.log('rout:' + route);

    const jwtToken = JSON.parse(localStorage.getItem('currentUser') || "{}");
    if (jwtToken) {

      if (this.jwtHelp.isTokenExpired(jwtToken.token)) {
        this.router.navigate(['auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
      } else {

        if (this.http.getUserGroup() == '1') return true;
        if (state.url.includes('not-allowed')) return true;

        let url: string = state.url;
        if (!this.AllowedURL(url)) {
          this.router.navigate(['not-allowed']);
          console.log(url);

          return false;
        } else{
          console.warn('restricted' + url);
          return true;
        }


      }
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  AllowedURL(url: string) {
    return true;
    let currentRT: RouteInfo | null = null;
    for (const rt of this.routes) {
      if (rt.path.includes(url)) {
        currentRT = rt;
        break;
      }
      for (const sub of rt.submenu) {
        if (sub.path.includes(url)) {
          currentRT = sub;
          break
        }
      }

      console.log('filtered', currentRT);


      if (currentRT) {
        const userMenu: any = this.http.getUserMenu()
        let menu = userMenu.find((x: any) => x.pageid == currentRT!.id);
        if (menu) {
          console.log(menu);
          return true
        }
      }
    }

    return false



  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    return this.canActivate(next, state);
    ;
  }
}
