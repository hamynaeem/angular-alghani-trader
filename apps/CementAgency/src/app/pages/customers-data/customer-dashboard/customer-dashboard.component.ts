import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerAuthService, CustomerUser } from '../services/customer-auth.service';

@Component({
  selector: 'app-customer-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="welcome-card">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h1 class="welcome-title">
                  Welcome back, {{ currentUser?.CustomerName }}!
                </h1>
                <p class="welcome-subtitle">
                  Manage your account and place orders from your personalized dashboard
                </p>
              </div>
              <div class="col-md-4 text-md-end">
                <div class="customer-avatar">
                  <i class="fa fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <h3 class="section-title">Quick Actions</h3>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="action-card" (click)="navigateTo('/customers/ledger')">
            <div class="action-icon bg-primary">
              <i class="fa fa-list-alt"></i>
            </div>
            <div class="action-content">
              <h5>View Ledger</h5>
              <p>Check your account statement and balance</p>
            </div>
            <div class="action-arrow">
              <i class="fa fa-arrow-right"></i>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="action-card" (click)="navigateTo('/customers/orders')">
            <div class="action-icon bg-success">
              <i class="fa fa-shopping-cart"></i>
            </div>
            <div class="action-content">
              <h5>Place Order</h5>
              <p>Create new orders with multiple items</p>
            </div>
            <div class="action-arrow">
              <i class="fa fa-arrow-right"></i>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="action-card" (click)="navigateTo('/customers/history')">
            <div class="action-icon bg-info">
              <i class="fa fa-history"></i>
            </div>
            <div class="action-content">
              <h5>Order History</h5>
              <p>View past orders and reorder items</p>
            </div>
            <div class="action-arrow">
              <i class="fa fa-arrow-right"></i>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="action-card" (click)="navigateTo('/customers/profile')">
            <div class="action-icon bg-warning">
              <i class="fa fa-user"></i>
            </div>
            <div class="action-content">
              <h5>Profile</h5>
              <p>Manage your account information</p>
            </div>
            <div class="action-arrow">
              <i class="fa fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Summary -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fa fa-chart-line me-2"></i>
                Account Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-4">
                  <div class="stat-item">
                    <div class="stat-value text-primary">
                      {{ currentUser?.Balance | currency:'PKR':'symbol':'1.2-2' }}
                    </div>
                    <div class="stat-label">Current Balance</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-item">
                    <div class="stat-value text-success">15</div>
                    <div class="stat-label">Total Orders</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-item">
                    <div class="stat-value text-info">3</div>
                    <div class="stat-label">Pending Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fa fa-info-circle me-2"></i>
                Contact Info
              </h5>
            </div>
            <div class="card-body">
              <div class="contact-item mb-2">
                <i class="fa fa-phone text-muted me-2"></i>
                <span>{{ currentUser?.PhoneNo1 }}</span>
              </div>
              <div class="contact-item mb-2" *ngIf="currentUser?.Email">
                <i class="fa fa-envelope text-muted me-2"></i>
                <span>{{ currentUser?.Email }}</span>
              </div>
              <div class="contact-item" *ngIf="currentUser?.Address">
                <i class="fa fa-map-marker-alt text-muted me-2"></i>
                <span>{{ currentUser?.Address }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fa fa-clock me-2"></i>
                Recent Activity
              </h5>
              <button class="btn btn-outline-primary btn-sm" (click)="navigateTo('/customers/history')">
                View All
              </button>
            </div>
            <div class="card-body">
              <div class="activity-timeline">
                <div class="activity-item">
                  <div class="activity-icon bg-success">
                    <i class="fa fa-shopping-cart"></i>
                  </div>
                  <div class="activity-content">
                    <h6 class="activity-title">Order #12345 Placed</h6>
                    <p class="activity-desc">Cement bags (50) - Total: ₨ 25,000</p>
                    <small class="activity-time">2 days ago</small>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon bg-info">
                    <i class="fa fa-truck"></i>
                  </div>
                  <div class="activity-content">
                    <h6 class="activity-title">Order #12340 Delivered</h6>
                    <p class="activity-desc">Steel rods (20) - Total: ₨ 15,000</p>
                    <small class="activity-time">1 week ago</small>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon bg-primary">
                    <i class="fa fa-credit-card"></i>
                  </div>
                  <div class="activity-content">
                    <h6 class="activity-title">Payment Received</h6>
                    <p class="activity-desc">Account credited with ₨ 30,000</p>
                    <small class="activity-time">2 weeks ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {
  currentUser: CustomerUser | null = null;

  constructor(
    private authService: CustomerAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
