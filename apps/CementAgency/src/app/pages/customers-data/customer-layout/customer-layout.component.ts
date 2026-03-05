import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthState, CustomerAuthService, CustomerUser } from '../services/customer-auth.service';

@Component({
  selector: 'app-customer-layout',
  template: `
    <div class="customer-portal-layout">
      <!-- Header -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container-fluid">
          <a class="navbar-brand" [routerLink]="['/customers/dashboard']">
          <img src="assets/img/logos/logo.png" alt="Cement Agency Logo" class="me-2" style="height: 36px;">
            Cement Agency Portal
          </a>

          <!-- Mobile menu toggle -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#customerNavbar"
            (click)="toggleMobileMenu()">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Navigation Menu -->
          <div class="collapse navbar-collapse" id="customerNavbar" [class.show]="showMobileMenu">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/customers/dashboard']"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: true}">
                  <i class="fa fa-dashboard"></i> Dashboard
                </a>
              </li>

              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/customers/ledger']"
                  routerLinkActive="active">
                  <i class="fas fa-file-invoice-dollar"></i> Ledger
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/customers/orders']"
                  routerLinkActive="active">
                  <i class="fa fa-shopping-cart"></i> Orders
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/customers/history']"
                  routerLinkActive="active">
                  <i class="fa fa-history"></i> History
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                 >

                </a>
              </li>
            </ul>

            <!-- User Menu -->
            <div class="navbar-nav ms-auto">
              <div class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle d-flex align-items-center"

                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  (click)="toggleUserMenu()">
                  <i class="fa fa-user-circle me-2"></i>
                  <span class="d-none d-md-inline">{{ currentUser?.CustomerName || 'User' }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" [class.show]="showUserMenu">
                  <li>
                    <div class="dropdown-header">
                      <strong>{{ currentUser?.CustomerName }}</strong><br>
                      <small class="text-muted">{{ currentUser?.PhoneNo1 }}</small>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" [routerLink]="['/customers/profile']">
                      <i class="fa fa-user me-2"></i> Profile
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" (click)="logout($event)">
                      <i class="fa fa-sign-out me-2"></i> Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Breadcrumb -->
      <div class="container-fluid bg-light border-bottom py-2" *ngIf="showBreadcrumb">
        <div class="row">
          <div class="col">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <a [routerLink]="['/customers/dashboard']">
                    <i class="fa fa-home"></i> Home
                  </a>
                </li>
                <li class="breadcrumb-item active" *ngIf="currentPage !== 'Dashboard'">
                  {{ currentPage }}
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container-fluid py-3">
          <!-- Loading Indicator -->
          <div *ngIf="authState.loading" class="text-center p-4">
            <i class="fa fa-spinner fa-spin fa-2x text-primary"></i>
            <p class="mt-2">Loading...</p>
          </div>

          <!-- Error Message -->
          <div *ngIf="authState.error" class="alert alert-danger alert-dismissible fade show">
            <i class="fa fa-exclamation-circle me-2"></i>
            {{ authState.error }}
            <button type="button" class="btn-close" (click)="clearError()"></button>
          </div>

          <!-- Router Outlet -->
          <router-outlet *ngIf="!authState.loading"></router-outlet>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer bg-dark text-light py-3 mt-auto">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-6">
              <small>&copy; 2025 Cement Agency. All rights reserved.</small>
            </div>
            <div class="col-md-6 text-md-end">
              <small>Customer Portal v1.0</small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./customer-layout.component.scss']
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };

  currentUser: CustomerUser | null = null;
  currentPage: string = 'Dashboard';
  showMobileMenu: boolean = false;
  showUserMenu: boolean = false;
  showBreadcrumb: boolean = true;

  constructor(
    private authService: CustomerAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;
        this.currentUser = state.user;
      });

    // Subscribe to router events for breadcrumb
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentPage(event.url);
        this.closeMobileMenus();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCurrentPage(url: string): void {
    if (url.includes('/accounts')) {
      this.currentPage = 'Account Statement';
    } else if (url.includes('/ledger')) {
      this.currentPage = 'Account Ledger';
    } else if (url.includes('/orders')) {
      this.currentPage = 'Place Order';
    } else if (url.includes('/history')) {
      this.currentPage = 'Order History';
    } else if (url.includes('/profile')) {
      this.currentPage = 'Profile';
    } else if (url.includes('/dashboard')) {
      this.currentPage = 'Dashboard';
    } else {
      this.currentPage = 'Dashboard';
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showMobileMenu = false;
    }
  }

  closeMobileMenus(): void {
    this.showMobileMenu = false;
    this.showUserMenu = false;
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }

  clearError(): void {
    // Implement error clearing logic if needed
  }
}
