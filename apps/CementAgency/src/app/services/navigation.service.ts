import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ROUTES } from '../shared/vertical-menu/vertical-menu-routes.config';
import { RouteInfo } from '../shared/vertical-menu/vertical-menu.metadata';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private VROUTES: RouteInfo[] = ROUTES;
  private AllowdPaths: string[] = [];
  private filteredRoutesSubject: BehaviorSubject<RouteInfo[]> = new BehaviorSubject<RouteInfo[]>([]);

  constructor() {
    this.loadFilteredRoutes();

    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'currentUser') {
        this.loadFilteredRoutes();
      }
    });
  }

  private loadFilteredRoutes() {

    const UserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userMenu = UserData && UserData.UserMenu;
    if (!userMenu || (Array.isArray(userMenu) && userMenu.length === 0)) {
      // Emit empty menu asynchronously to avoid ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => this.filteredRoutesSubject.next([]));
      return;
    }

    const pageIds = (Array.isArray(userMenu) ? userMenu : [])
      .map((item: any) => Number(item.pageid));

    const filteredRoutes = this.VROUTES.map(item => {
      const filteredSubmenu = (item.submenu || []).filter(sub => pageIds.includes(Number(sub.id)));

      if (pageIds.includes(Number(item.id)) || filteredSubmenu.length > 0) {
        return {
          ...item,
          submenu: filteredSubmenu
        };
      }
      return null;
    }).filter(item => item !== null) as RouteInfo[];

    this.extractPathsFromArray(filteredRoutes);
    // Emit asynchronously to avoid changing bindings during change detection
    Promise.resolve().then(() => this.filteredRoutesSubject.next(filteredRoutes));
  }

  getFilteredRoutes(): Observable<RouteInfo[]> {
    return this.filteredRoutesSubject.asObservable();
  }

  refreshRoutes() {
    this.loadFilteredRoutes();
  }

  extractPathsFromArray(array: RouteInfo[]): void {
    this.AllowdPaths = [];

    array.forEach(item => {
      this.AllowdPaths.push(item.path);

      if (item.submenu && item.submenu.length > 0) {
        item.submenu.forEach(subItem => {
          this.AllowdPaths.push(subItem.path);
        });
      }
    });
  }

  getPaths(): string[] {
    return this.AllowdPaths;
  }

  isPathAllowed(path: string): boolean {
    console.log(this.AllowdPaths);

    return this.AllowdPaths.some(allowedPath => {
      const regex = new RegExp(`^${allowedPath.replace(/:[^\/]+/g, '[^/]+')}$`);
      return regex.test(path);
    });
  }
}

