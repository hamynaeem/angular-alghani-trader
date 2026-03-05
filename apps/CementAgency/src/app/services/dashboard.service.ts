import { Injectable } from '@angular/core';
import { HttpBase } from './httpbase.service';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpBase) {}

  // Get recent sales data
  getRecentSales() {
    return this.http.getTask('Tasks/recentSales');
  }

  // Real API methods for dashboard data
  getSalesSummary(): Observable<any> {
    return from(this.http.getTask('Tasks/salesSummary'));
  }

  getPurchaseSummary(): Observable<any> {
    return from(this.http.getTask('Tasks/purchaseSummary'));
  }

  getInventorySummary(): Observable<any> {
    return from(this.http.getTask('Tasks/inventorySummary'));
  }

  getTopSellingProducts(): Observable<any> {
    return from(this.http.getTask('Tasks/topSellingProducts'));
  }

  getTopCustomers(): Observable<any> {
    return from(this.http.getTask('Tasks/topCustomers'));
  }

  getCashFlowSummary(): Observable<any> {
    return from(this.http.getTask('Tasks/cashFlowSummary'));
  }

  getMonthlySalesData(): Observable<any> {
    return from(this.http.getTask('Tasks/monthlySalesData'));
  }

  getMonthlyPurchaseData(): Observable<any> {
    return from(this.http.getTask('Tasks/monthlyPurchaseData'));
  }

  // Mock data methods have been replaced with real API calls
}