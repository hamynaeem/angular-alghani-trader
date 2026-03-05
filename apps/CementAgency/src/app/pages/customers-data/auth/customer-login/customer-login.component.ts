import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthState, CustomerAuthService } from '../../services/customer-auth.service';

@Component({
  selector: 'app-customer-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header text-center">
          <div class="mb-3 d-flex justify-content-center">
            <div
              style="
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border: 2px solid #e0e0e0;
              "
            >
              <!-- Replace src with your logo image path -->
              <img
                src="assets/img/logos/logo.png"
                alt="Logo"
                style="width: 110px; height: 110px; object-fit: contain;"
              />
            </div>
          </div>
          <h2 class="mb-2">Customer Login</h2>
          <p class="text-muted">Enter your mobile number and PIN to access your account</p>
        </div>

        <!-- Login Form -->
        <form #loginForm="ngForm" (ngSubmit)="onLogin()" class="login-form">
          <!-- Mobile Number Field -->
          <div class="form-group mb-3">
            <label for="mobileNo" class="form-label">
              <i class="fa fa-mobile me-2"></i>Mobile Number
            </label>
            <input
              type="tel"
              id="mobileNo"
              name="mobileNo"
              class="form-control form-control-lg"
              [(ngModel)]="credentials.mobileNo"
              placeholder="Enter your mobile number"
              required
              maxlength="11"
              [class.is-invalid]="mobileNoField.invalid && (mobileNoField.dirty || mobileNoField.touched)"
              #mobileNoField="ngModel"
            />
            <div class="invalid-feedback" *ngIf="mobileNoField.invalid && (mobileNoField.dirty || mobileNoField.touched)">
              Please enter a valid mobile number
            </div>
          </div>

          <!-- PIN Field -->
          <div class="form-group mb-4">
            <label for="pin" class="form-label d-flex justify-content-between align-items-center">
              <span><i class="fa fa-lock me-2"></i>PIN</span>
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-primary"
                (click)="requestPin()"
                [disabled]="!credentials.mobileNo || pinRequested">
                {{ pinRequested ? 'PIN Sent!' : 'Request PIN' }}
              </button>
            </label>
            <div class="input-group">
              <input
                [type]="showPin ? 'text' : 'password'"
                id="pin"
                name="pin"
                class="form-control form-control-lg"
                [(ngModel)]="credentials.pin"
                placeholder="Enter your PIN"
                required
                maxlength="6"
                [class.is-invalid]="pinField.invalid && (pinField.dirty || pinField.touched)"
                #pinField="ngModel"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="togglePinVisibility()">
                <i class="fa" [class.fa-eye]="!showPin" [class.fa-eye-slash]="showPin"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="pinField.invalid && (pinField.dirty || pinField.touched)">
              Please enter your PIN
            </div>
          </div>

          <!-- Error Display -->
          <div class="alert alert-danger d-flex align-items-center" *ngIf="authState.error" role="alert">
            <i class="fa fa-exclamation-triangle me-2"></i>
            <div>{{ authState.error }}</div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100 mb-3"
            [disabled]="!loginForm.form.valid || authState.loading">
            <span *ngIf="authState.loading">
              <i class="fa fa-spinner fa-spin me-2"></i>
              Logging in...
            </span>
            <span *ngIf="!authState.loading">
              <i class="fa fa-sign-in me-2"></i>
              Login
            </span>
          </button>

          <!-- Help Text -->
          <div class="text-center">
            <small class="text-muted">
              Don't have a PIN? Contact us or click "Request PIN" above.
            </small>
          </div>
        </form>

        <!-- Footer -->
        <div class="login-footer text-center mt-4 pt-4 border-top">
          <p class="mb-2">
            <strong>Need Help?</strong>
          </p>
          <p class="text-muted small mb-0">
            Contact customer service for assistance with your account
          </p>
        </div>
      </div>

      <!-- Background Info -->
      <div class="info-panel d-none d-lg-block">
        <div class="info-content">
          <h3 class="text-white mb-4">
            <i class="fa fa-check-circle me-2"></i>
            Customer Portal Features
          </h3>
          <ul class="list-unstyled text-white-50">
            <li class="mb-3">
              <i class="fa fa-list-alt me-2 text-white"></i>
              View account statements and balance
            </li>
            <li class="mb-3">
              <i class="fa fa-shopping-cart me-2 text-white"></i>
              Place orders online 24/7
            </li>
            <li class="mb-3">
              <i class="fa fa-history me-2 text-white"></i>
              Track order history and status
            </li>
            <li class="mb-3">
              <i class="fa fa-mobile me-2 text-white"></i>
              Access from any device, anywhere
            </li>
            <li class="mb-3">
              <i class="fa fa-print me-2 text-white"></i>
              Print invoices and statements
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./customer-login.component.scss']
})
export class CustomerLoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  credentials = {
    mobileNo: '',
    pin: ''
  };

  authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };

  showPin = false;
  pinRequested = false;
  returnUrl = '/customers/dashboard';

  constructor(
    private authService: CustomerAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/customers/dashboard';

    // Subscribe to auth state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;

        if (state.isAuthenticated) {
          this.router.navigate([this.returnUrl]);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onLogin(): Promise<void> {
    if (!this.credentials.mobileNo || !this.credentials.pin) {
      return;
    }

    const success = await this.authService.login(this.credentials.mobileNo, this.credentials.pin);

    if (success) {
      this.router.navigate([this.returnUrl]);
    }
  }

  async requestPin(): Promise<void> {
    if (!this.credentials.mobileNo) {
      return;
    }

    this.pinRequested = await this.authService.requestPin(this.credentials.mobileNo);
  }

  togglePinVisibility(): void {
    this.showPin = !this.showPin;
  }
}
