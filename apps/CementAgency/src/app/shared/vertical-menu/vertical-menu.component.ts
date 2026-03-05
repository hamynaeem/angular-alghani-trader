import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit, ViewChild
} from "@angular/core";
import { HROUTES } from '../horizontal-menu/navigation-routes.config';
import { ROUTES } from './vertical-menu-routes.config';

import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { HttpBase } from "../../services/httpbase.service";
import { NavigationService } from "../../services/navigation.service";
import { customAnimations } from "../animations/custom-animations";
import { ConfigService } from '../services/config.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: "app-sidebar",
  templateUrl: "./vertical-menu.component.html",
  animations: customAnimations
})
export class VerticalMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('toggleIcon') toggleIcon: ElementRef;
  public menuItems: any[];
  level: number = 0;
  logoUrl = 'assets/img/logos/logo.png';
  public config: any = {};
  protected innerWidth: any;
  layoutSub: Subscription;
  configSub: Subscription;
  perfectScrollbarEnable = true;
  collapseSidebar = false;
  resizeTimeout;

  constructor(
    private http: HttpBase,
    public translate: TranslateService,
    private layoutService: LayoutService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private navigation: NavigationService,
    private deviceService: DeviceDetectorService
  ) {
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;
    this.isTouchDevice();
  }


  ngOnInit() {


    //  this.menuItems = this.LoadMenu();


    this.navigation.getFilteredRoutes().subscribe(r=>{
      console.log(r);

      this.menuItems = r;
    })

  }
  LoadMenu() {

    if (this.http.getUserGroup() == '1') {
      return ROUTES;
    } else {
      let userMenu = this.http.getUserMenu();
      let GroupID = Number(this.http.getUserGroup());
      console.log(`GroupID: ${GroupID}`);

      return  this.FilterMenu(userMenu, ROUTES);
    }
  }

   FilterMenu(usermenu: any, menu: any): any[] {
    const pageIds = usermenu.map(item => Number(item.pageid));

    return menu.map(item => {
      // Filter top-level menu
      const filteredSubmenu = item.submenu.filter(sub => pageIds.includes(sub.id));

      // Return filtered item if it contains matching submenu
      if (pageIds.includes(item.id) || filteredSubmenu.length > 0) {
        return {
          ...item,
          submenu: filteredSubmenu
        };
      }

      return null;
    }).filter(item => item !== null) as any[];
  }


  ngAfterViewInit() {

    this.configSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) {
        this.config = templateConf;
      }
      this.loadLayout();
      this.cdr.markForCheck();

    });

    this.layoutSub = this.layoutService.overlaySidebarToggle$.subscribe(
      collapse => {
        if (this.config.layout.menuPosition === "Side") {
          this.collapseSidebar = collapse;
        }
      });

  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout((() => {
      this.innerWidth = event.target.innerWidth;
      this.loadLayout();
    }).bind(this), 500);
  }

  loadLayout() {

    if (this.config.layout.menuPosition === "Top") { // Horizontal Menu
      if (this.innerWidth < 1200) { // Screen size < 1200
        this.menuItems = HROUTES;
      }
    }
    else if (this.config.layout.menuPosition === "Side") { // Vertical Menu{
      // this.menuItems = ROUTES;
      this.menuItems = this.LoadMenu();
    }




    if (this.config.layout.sidebar.backgroundColor === 'white') {
      this.logoUrl = 'assets/img/logos/logo-dark.png';
    }
    else {
      this.logoUrl = 'assets/img/logos/logo.png';
    }

    if (this.config.layout.sidebar.collapsed) {
      this.collapseSidebar = true;
    }
    else {
      this.collapseSidebar = false;
    }
  }

  toggleSidebar() {
    let conf = this.config;
    conf.layout.sidebar.collapsed = !this.config.layout.sidebar.collapsed;
    this.configService.applyTemplateConfigChange({ layout: conf.layout });

    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }

  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };

  CloseSidebar() {
    this.layoutService.toggleSidebarSmallScreen(false);
  }

  isTouchDevice() {

    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();

    if (isMobile || isTablet) {
      this.perfectScrollbarEnable = false;
    }
    else {
      this.perfectScrollbarEnable = true;
    }

  }


  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
    if (this.configSub) {
      this.configSub.unsubscribe();
    }

  }

}
