import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-orders-report',
  templateUrl: './orders-report.component.html',
  styleUrls: ['./orders-report.component.scss'],
})
export class OrdersReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable;
  public loadingOrders: boolean = false;

  // For Add Order Form
  public showAddOrderForm = false;
  public newOrder: any = {
    OrderID: '',
    OrderDate: '',
    DeliveryDate: '',
    CustomerName: '',
    DeliveryAddress: '',
    ProductName: '',
    Quantity: null,
    Total: null,
    Status: ''
  };

public orderActions = {
  confirm: {
    status: 'Confirmed',
    action: 'confirm',
    confirmMessage: 'Do you want to confirm this order?',
    successMessage: 'Order confirmed successfully'
  },
  ship: {
    status: 'Shipped',
    action: 'ship',
    confirmMessage: 'Do you want to mark this order as shipped?',
    successMessage: 'Order marked as shipped successfully'
  },
  complete: {
    status: 'Completed',
    action: 'complete',
    confirmMessage: 'Do you want to mark this order as completed?',
    successMessage: 'Order completed successfully'
  },
  cancel: {
    status: 'Cancelled',
    action: 'cancel',
    confirmMessage: 'Do you want to cancel this order?',
    successMessage: 'Order cancelled successfully'
  },
  pending: {
    status: 'Pending',
    action: 'pending',
    confirmMessage: 'Do you want to mark this order as pending?',
    successMessage: 'Order marked as pending successfully'
  }
};





  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    Status: '',
    CustomerID: '',
  };
  setting = {
    Checkbox: false,
    Crud: true,
    Columns: [
      {
        label: 'Order No',
        fldName: 'OrderID',
      },
      {
        label: 'Order Date',
        fldName: 'OrderDate',
      },

      {
        label: 'Delivery Date',
        fldName: 'DeliveryDate',
      },
      {
        label: 'Customer',
        fldName: 'CustomerName',
      },
      {
        label: 'Delivery Address',
        fldName: 'DeliveryAddress',
      },
      {
        label: 'Product',
        fldName: 'ProductName',
      },
      {
        label: 'Quantity',
        fldName: 'Quantity',
        type: 'number',
      },
      {
        label: 'Amount',
        fldName: 'Total',
        sum: true,
        type: 'sum',
      },

      {
        label: 'Status',
        fldName: 'Status',
      },
    ],
    Actions: [
      {
        action: 'confirm',
        label: 'Confirm Order',
        class: 'btn-success btn-sm',
        icon: 'fa fa-check',

      },
      {
        action: 'ship',
        label: 'Mark as Shipped',
        class: 'btn-info btn-sm',
        icon: 'fa fa-truck',

      },
      {
        action: 'complete',
        label: 'Mark Complete',
        class: 'btn-primary btn-sm',
        icon: 'fa fa-check-circle',

      },
      {
        action: 'cancel',
        label: 'Cancel Order',
        class: 'btn-warning btn-sm',
        icon: 'fa fa-times',

      }
    ],
    Data: [],
  };

  nWhat = '1';
  Customers: any = [{ ItemID: '1', ItemName: 'Test Item' }];
  Products: any = [];
  // Local fallback for orders when server is unreachable
  public localOrders: any[] = [];

  public data: object[];
  public Accounts: any;
  public selectedCustomer: any = {};

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router
  ) {
    this.Accounts = this.cachedData.Accounts$;
  }

  ngOnInit() {
    this.LoadCustomers();
    this.LoadProducts();
    this.FilterData();
    // load local unsynced orders from localStorage so they show in the table
    try {
      const raw = localStorage.getItem('local_orders');
      this.localOrders = raw ? JSON.parse(raw) : [];
      if (this.localOrders && this.localOrders.length) {
        this.data = [...(this.data || []), ...this.localOrders];
        this.setting.Data = this.data;
      }
    } catch (e) {
      console.warn('Failed to load local orders', e);
      this.localOrders = [];
    }
  }

  async LoadProducts() {
    try {
      this.cachedData.Products$.subscribe((data) => {
        this.Products = data || [];
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.Products = [];
    }
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title =
      'Orders Report ' +
      (this.Filter.CustomerID
        ? ' Customer: ' + this.selectedCustomer.CustomerName
        : '');
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  CustomerSelected(e) {
    console.log(e);
    this.selectedCustomer = e;
  }
  FilterData() {
    // Build filter string
    // tslint:disable-next-line:quotemark
    let filter =
      "OrderDate between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";
    if (this.Filter.Status != '') {
      filter += " and Status ='" + this.Filter.Status + "'";
    }

    if (this.Filter.CustomerID) filter += ' and CustomerID=' + this.Filter.CustomerID;

    const params = { filter };

    // Fetch orders using parameterized call so HttpBase builds HttpParams (safe encoding)
    this.loadingOrders = true;
    this.http
      .getData('qryorders', params)
      .then((r: any) => {
        console.log('qryorders response:', r);

        // Support multiple response shapes: array, { data: [...] }, { rows: [...] }, { result: [...] }
        let rows: any[] = [];
        if (Array.isArray(r)) rows = r;
        else if (r && Array.isArray(r.data)) rows = r.data;
        else if (r && Array.isArray(r.rows)) rows = r.rows;
        else if (r && Array.isArray(r.result)) rows = r.result;
        else if (r && typeof r === 'object') {
          // pick first array found on the response object
          const firstArray = Object.keys(r).map((k) => (r as any)[k]).find((v) => Array.isArray(v));
          if (firstArray) rows = firstArray;
        }

        let serverData = rows.map((obj: any) => ({
          ...obj,
          OrderDate: obj.OrderDate ? (obj.OrderDate + '').substring(0, 10) : obj.OrderDate,
          DeliveryDate: obj.DeliveryDate ? (obj.DeliveryDate + '').substring(0, 10) : obj.DeliveryDate,
        }));

        // Merge local unsynced orders so they are visible in the report
        try {
          const raw = localStorage.getItem('local_orders');
          const local = raw ? JSON.parse(raw) : [];
          // dedupe by OrderID: prefer server rows when IDs match
          const byId: any = {};
          (serverData || []).forEach((s: any) => (byId[s.OrderID] = s));
          (local || []).forEach((l: any) => {
            if (!byId[l.OrderID]) {
              // ensure date format
              l.OrderDate = l.OrderDate ? (l.OrderDate + '').substring(0, 10) : l.OrderDate;
              l.DeliveryDate = l.DeliveryDate ? (l.DeliveryDate + '').substring(0, 10) : l.DeliveryDate;
              byId[l.OrderID] = l;
            }
          });

          // produce merged array and sort by OrderDate desc
          this.data = Object.keys(byId)
            .map((k) => byId[k])
            .sort((a: any, b: any) => (new Date(b.OrderDate).getTime() || 0) - (new Date(a.OrderDate).getTime() || 0));
        } catch (e) {
          console.warn('Failed to merge local orders', e);
          this.data = serverData;
        }

        // Also provide data to table settings in case the table reads from settings.Data
        this.setting.Data = this.data;
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        // If server fetch failed, try to load local unsynced orders so user still sees manually added rows
        try {
          const raw = localStorage.getItem('local_orders');
          const local = raw ? JSON.parse(raw) : [];
          this.data = local.map((l: any) => ({
            ...l,
            OrderDate: l.OrderDate ? (l.OrderDate + '').substring(0, 10) : l.OrderDate,
            DeliveryDate: l.DeliveryDate ? (l.DeliveryDate + '').substring(0, 10) : l.DeliveryDate,
          }));
          this.setting.Data = this.data;
        } catch (e) {
          console.warn('Failed to load local orders after server error', e);
          this.data = [];
          this.setting.Data = [];
        }
      })
      .finally(() => {
        this.loadingOrders = false;
      });
  }
  Clicked(e) {
    console.log(e);

    const actionConfig = this.orderActions[e.action];
    if (actionConfig) {
      Swal.fire({
        title: 'Are you sure?',
        text: actionConfig.confirmMessage,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed!',
        cancelButtonText: 'No, cancel',
        confirmButtonColor: e.action === 'cancel' ? '#dc3545' : '#28a745',
        cancelButtonColor: '#6c757d'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ChangeStatus(e.data, actionConfig.status, actionConfig.successMessage);
        }
      });
    }
  }
  ChangeStatus(row: any, status: string, successMessage: string = 'Order status updated successfully') {
    // Implement your status change logic here
    console.log(`Changing status of order ${row.OrderID} to ${status}`);

    this.http.postData('orders/' + row.OrderID, {
      OrderID: row.OrderID,
      Status: status
    }).then((res) => {
      Swal.fire('Success', successMessage, 'success');
      this.FilterData(); // Refresh the data after status change

      // If order confirmed, open Booking screen and instruct it to auto-select this order
      if (status === 'Confirmed') {
        this.router.navigate(['/purchase/booking'], { queryParams: { confirmedOrderID: row.OrderID } });
      }
    }).catch((error) => {
      console.error('Error updating order status:', error);
      Swal.fire('Error', 'Failed to update order status', 'error');
    });
  }
  async LoadCustomers() {
    try {
      this.cachedData.Accounts$.subscribe((data) => {
        this.Customers = data || [];
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      this.Customers = [];
    }
  }
  getStatusList() {
    return Object.keys(this.orderActions);
    }
  // Add Order handler
  addOrder() {
    // Simple validation (exclude Status)
    if (!this.newOrder.OrderID || !this.newOrder.OrderDate || !this.newOrder.CustomerName || !this.newOrder.ProductName || !this.newOrder.Quantity || !this.newOrder.Total) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }
    // Build order payload compatible with customer_orders API
    // Find customer by name to get CustomerID
    const customer = (this.Customers || []).find((c: any) => c.CustomerName == this.newOrder.CustomerName);
    const customerID = customer ? customer.CustomerID : null;
    if (!customerID) {
      Swal.fire('Error', 'Customer not found. Please select a valid customer.', 'error');
      return;
    }

    // Find product by name to get ProductID and a default rate
    const product = (this.Products || []).find((p: any) => p.ProductName == this.newOrder.ProductName);
    const productID = product ? product.ProductID : null;
    const rate = product ? (product.SPrice || product.Price || 0) : 0;

    const orderPayload: any = {
      CustomerID: customerID,
      OrderDate: GetDateJSON(new Date(this.newOrder.OrderDate || new Date())),
      DeliveryDate: this.newOrder.DeliveryDate ? GetDateJSON(new Date(this.newOrder.DeliveryDate)) : GetDateJSON(new Date()),
      DeliveryAddress: this.newOrder.DeliveryAddress || '',
      Notes: '',
      Status: this.newOrder.Status || 'Pending',
      Items: [
        {
          ProductID: productID,
          ProductName: this.newOrder.ProductName,
          Quantity: this.newOrder.Quantity || 1,
          Rate: rate,
          Total: this.newOrder.Total || ((this.newOrder.Quantity || 1) * rate)
        }
      ]
    };

    this.http.postData('customer_orders', orderPayload).then((res: any) => {
      Swal.fire('Success', 'Order saved to server', 'success');

      const createdOrderID = (res && (res.OrderID || res.orderID)) || orderPayload.OrderID || ('srv-' + new Date().getTime());
      const savedStatus = (res && (res.Status || res.status)) || orderPayload.Status || 'Pending';

      // Immediately show the saved order in the table so user sees it right away
      try {
        const orderDateStr = (this.newOrder.OrderDate || new Date()).toString().substring(0,10);
        const displayRow = {
          OrderID: createdOrderID,
          OrderDate: orderDateStr,
          DeliveryDate: this.newOrder.DeliveryDate || '',
          CustomerName: this.newOrder.CustomerName,
          DeliveryAddress: this.newOrder.DeliveryAddress || '',
          ProductName: this.newOrder.ProductName,
          Quantity: this.newOrder.Quantity,
          Total: this.newOrder.Total,
          Status: savedStatus,
          _synced: true
        };
        this.data = [displayRow, ...(this.data || [])];
        this.setting.Data = this.data;
      } catch (e) {
        console.warn('Unable to prepend display row', e);
      }

      this.showAddOrderForm = false;
      const addedOrderDate = this.newOrder.OrderDate || new Date().toISOString().substring(0,10);

      this.newOrder = {
        OrderID: '',
        OrderDate: '',
        DeliveryDate: '',
        CustomerName: '',
        DeliveryAddress: '',
        ProductName: '',
        Quantity: null,
        Total: null,
        Status: ''
      };

      // Expand the filter range to include the added order date then refresh
      try {
        const d = new Date(addedOrderDate);
        this.Filter.FromDate = GetDateJSON(d);
        this.Filter.ToDate = GetDateJSON(d);
      } catch (_) {}
      this.FilterData();

      if ((savedStatus + '').toLowerCase() === 'confirmed' && createdOrderID) {
        this.router.navigate(['/purchase/booking'], { queryParams: { confirmedOrderID: createdOrderID } });
      }
    }).catch((err) => {
      console.error('Failed to save customer_order:', err);
      // Fallback: save locally so order appears in UI and can be synced later
      try {
        const tempID = 'local-' + new Date().getTime();
        const localEntry = {
          OrderID: tempID,
          OrderDate: this.newOrder.OrderDate || new Date().toISOString().substring(0,10),
          DeliveryDate: this.newOrder.DeliveryDate || '',
          CustomerName: this.newOrder.CustomerName,
          CustomerID: customerID,
          DeliveryAddress: this.newOrder.DeliveryAddress || '',
          ProductName: this.newOrder.ProductName,
          ProductID: productID,
          Rate: rate,
          Quantity: this.newOrder.Quantity,
          Total: this.newOrder.Total,
          Status: this.newOrder.Status || 'Pending',
          _unsynced: true,
        };
        this.localOrders.push(localEntry);
        localStorage.setItem('local_orders', JSON.stringify(this.localOrders));
        // Ensure local entry is immediately visible
        this.data = [localEntry, ...(this.data || [])];
        this.setting.Data = this.data;
        this.showAddOrderForm = false;
        // Expand filter to include this local entry date so it remains visible after refresh
        try {
          const d = new Date(localEntry.OrderDate);
          this.Filter.FromDate = GetDateJSON(d);
          this.Filter.ToDate = GetDateJSON(d);
        } catch (_) {}
        this.newOrder = {
          OrderID: '', OrderDate: '', DeliveryDate: '', CustomerName: '', DeliveryAddress: '', ProductName: '', Quantity: null, Total: null, Status: ''
        };
        Swal.fire('Saved locally', 'Order saved locally (offline). It will be synced when server is available.', 'warning');
      } catch (ex) {
        console.error('Local save failed', ex);
        Swal.fire('Error', 'Failed to save order to server', 'error');
      }
    });
  }
  }
