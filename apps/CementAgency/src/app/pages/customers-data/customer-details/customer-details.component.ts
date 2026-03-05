import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDate } from '../../../../../../../libs/future-tech-lib/src/lib/utilities/utilities';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
})
export class CustomerDetailsComponent implements OnInit {
  public data: any = [];
  public Products: object[];
  public Users: object[];
  public isLoggedIn: boolean = true; // Always logged in when in protected routes
  public activeTab: string = 'accounts';

  public Filter = {
    FromDate: GetDateJSON(new Date(GetDate(null))),
    ToDate: GetDateJSON(new Date(GetDate(null))),
    CustomerID: '',
    MobileNo: '',
    PIN: '',
  };

  customer: any = {};

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private myToaster: MyToastService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: CustomerAuthService
  ) {}

  ngOnInit() {
    this.Filter.FromDate.day = 1;

    // Get active tab from route data
    const routeData = this.route.snapshot.data;
    if (routeData['activeTab']) {
      this.activeTab = routeData['activeTab'];
    }

    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.customer = currentUser;
      this.Filter.CustomerID = currentUser.CustomerID;
    }
  }  FindCustomer() {
    // This method is no longer needed since authentication is handled by AuthService
    // Kept for backward compatibility
  }

  logout() {
    this.authService.logout();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onOrderPlaced(orderData: any) {
    this.myToaster.Sucess('Order placed successfully!', 'Order Confirmation');
    // Optionally switch to order history tab
    this.setActiveTab('history');
  }

  GetDate(n) {
    if (n == 1) {
      return JSON2Date(this.Filter.FromDate);
    } else {
      return JSON2Date(this.Filter.ToDate);
    }
  }

  PrintReport() {
    this.ps.PrintData.Title = "Customer Accounts Report";
    this.ps.PrintData.SubTitle = "From: " + JSON2Date(this.Filter.FromDate);
    this.ps.PrintData.SubTitle += " To: " + JSON2Date(this.Filter.ToDate);
    this.ps.PrintData.CustomerName = "Customer: " + this.customer.CustomerName;

    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.router.navigateByUrl('/print/print-html');
  }
}
