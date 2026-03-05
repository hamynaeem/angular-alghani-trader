import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpBase } from '../../services/httpbase.service';
import { NavigationService } from '../../services/navigation.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  group_id = '';
  MenuItems: any = [];
  
  // Dashboard data
  salesSummary: any;
  purchaseSummary: any;
  inventorySummary: any;
  topSellingProducts: any;
  topCustomers: any;
  cashFlowSummary: any;
  
  // Chart data
  salesChartData: any;
  purchaseChartData: any;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  
  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Amount';
  
  constructor(
    private navigation: NavigationService, 
    private http: HttpBase,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    // Load menu items
    this.loadMenuItems();
    
    // Load dashboard data
    this.loadDashboardData();
  }
  
  loadMenuItems() {
    this.navigation
      .getFilteredRoutes()
      .subscribe((menu) => {
        this.MenuItems = this.MenuItems.concat(
          menu.filter((x) => {
            return x.path.includes('account');
          })
        );
        this.MenuItems = this.MenuItems.concat(
          menu.filter((x) => {
            return x.path.includes('cash');
          })
        );
        this.MenuItems = this.MenuItems.concat(
          menu.filter((x) => {
            return x.path.includes('reports');
          })
        );
      });
  }
  
  loadDashboardData() {
    // Load sales summary data
    this.dashboardService.getSalesSummary().subscribe(data => {
      this.salesSummary = data;
    });
    
    // Load purchase summary data
    this.dashboardService.getPurchaseSummary().subscribe(data => {
      this.purchaseSummary = data;
    });
    
    // Load inventory summary data
    this.dashboardService.getInventorySummary().subscribe(data => {
      this.inventorySummary = data;
    });
    
    // Load top selling products
    this.dashboardService.getTopSellingProducts().subscribe(data => {
      this.topSellingProducts = data;
    });
    
    // Load top customers
    this.dashboardService.getTopCustomers().subscribe(data => {
      this.topCustomers = data;
    });
    
    // Load cash flow summary
    this.dashboardService.getCashFlowSummary().subscribe(data => {
      this.cashFlowSummary = data;
    });
    
    // Load chart data
    this.dashboardService.getMonthlySalesData().subscribe(data => {
      this.salesChartData = [{
        name: 'Monthly Sales',
        series: data
      }];
    });
    
    this.dashboardService.getMonthlyPurchaseData().subscribe(data => {
      this.purchaseChartData = [{
        name: 'Monthly Purchases',
        series: data
      }];
    });
  }
}
