import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

export interface CustomerUser {
  CustomerID: string;
  CustomerName: string;
  PhoneNo1: string;
  Address?: string;
  Email?: string;
  Balance?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CustomerUser | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private readonly STORAGE_KEY = 'customerAuth';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpBase,
    private router: Router,
    private toaster: MyToastService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const savedAuth = this.getStoredAuth();
    if (savedAuth && savedAuth.user) {
      this.updateAuthState({
        isAuthenticated: true,
        user: savedAuth.user,
        loading: false,
        error: null
      });
    }
  }

  async login(mobileNo: string, pin: string): Promise<boolean> {
    if (!mobileNo || !pin) {
      this.updateAuthState({ ...this.currentState, error: 'Please enter both mobile number and PIN' });
      return false;
    }

    this.updateAuthState({ ...this.currentState, loading: true, error: null });

    try {
      const filter = `PhoneNo = '${mobileNo}' and PinCode = ${pin}`;
      const result: any = await this.http.getData('customers?filter=' + filter);

      if (result && result.length > 0) {
        const user: CustomerUser = {
          CustomerID: result[0].CustomerID,
          CustomerName: result[0].CustomerName,
          PhoneNo1: result[0].PhoneNo,
          Address: result[0].Address,
          Email: result[0].Email,
          Balance: result[0].Balance
        };

        this.updateAuthState({
          isAuthenticated: true,
          user: user,
          loading: false,
          error: null
        });

        this.storeAuth({ isAuthenticated: true, user });
        this.toaster.Sucess('Login successful!', 'Welcome ' + user.CustomerName);
        return true;
      } else {
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Invalid PIN or Mobile number'
        });
        this.toaster.Error('Invalid PIN or Mobile number', 'Authentication Failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'An error occurred during login. Please try again.'
      });
      this.toaster.Error('An error occurred during login. Please try again.', 'Error');
      return false;
    }
  }

  logout(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });

    this.clearStoredAuth();
    this.toaster.Info('You have been logged out successfully', 'Logout');
    this.router.navigate(['/customers/auth/login']);
  }

  requestPin(mobileNo: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate PIN request - implement actual API call here
      this.toaster.Info('PIN sent to your mobile number', 'PIN Requested');
      resolve(true);
    });
  }

  getCurrentUser(): CustomerUser | null {
    return this.currentState.user;
  }

  isAuthenticated(): boolean {
    return this.currentState.isAuthenticated;
  }

  private get currentState(): AuthState {
    return this.authStateSubject.value;
  }

  private updateAuthState(newState: AuthState): void {
    this.authStateSubject.next(newState);
  }

  private storeAuth(auth: { isAuthenticated: boolean; user: CustomerUser | null }): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error('Error storing auth state:', error);
    }
  }

  private getStoredAuth(): { isAuthenticated: boolean; user: CustomerUser | null } | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving auth state:', error);
      return null;
    }
  }

  private clearStoredAuth(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }

  // Public helper to set the current customer programmatically (used when opening ledger)
  public setCustomer(user: CustomerUser | null): void {
    this.updateAuthState({
      isAuthenticated: !!user,
      user: user,
      loading: false,
      error: null,
    });
    this.storeAuth({ isAuthenticated: !!user, user });
  }
}
