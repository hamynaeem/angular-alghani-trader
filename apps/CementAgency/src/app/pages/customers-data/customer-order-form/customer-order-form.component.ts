import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

declare var $: any;

@Component({
  selector: 'app-customer-order-form',
  templateUrl: './customer-order-form.component.html',
  styleUrls: ['./customer-order-form.component.scss']
})
export class CustomerOrderFormComponent implements OnInit {
  @Input() customer: any = {};
  @Output() orderPlaced = new EventEmitter<any>();

  public products: any[] = [];
  public isSubmitting: boolean = false;

  // Orders listing properties
  public showOrdersList: boolean = false;
  public ordersData: any[] = [];
  public selectedOrder: any = {};
  public newStatus: string = '';

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    Status: ''
  };

  public StatusList = [
    { name: 'Pending', value: 'Pending' },
    { name: 'Approved', value: 'Approved' },
    { name: 'Shipped', value: 'Shipped' },
    { name: 'Completed', value: 'Completed' }
  ];

  public ordersSetting = {
    Checkbox: false,
    Columns: [
      {
        label: 'Order ID',
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
        label: 'Product',
        fldName: 'ProductName',
      },
      {
        label: 'Qty',
        fldName: 'Quantity',
        sum: true,
      },
      {
        label: 'Rate',
        fldName: 'Rate',
      },
      {
        label: 'Total',
        fldName: 'Total',
        sum: true,
      },
      {
        label: 'Status',
        fldName: 'Status',
      },
    ],
    Actions: [
      {
        label: 'Change Status',
        action: 'change-status',
        icon: 'fa fa-edit',
        class: 'btn-warning btn-sm'
      }
    ],
    Data: [],
  };

  public order = {
    CustomerID: '',
    DeliveryDate: GetDateJSON(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
    DeliveryAddress: '',
    Notes: '',
    Items: [
      {
        ProductID: '',
        ProductName: '',
        Quantity: 1,
        Rate: 0,
        Total: 0
      }
    ]
  };

  constructor(
    private http: HttpBase,
    private myToaster: MyToastService
  ) {}

  ngOnInit() {
    this.order.CustomerID = this.customer.CustomerID;
    this.order.DeliveryAddress = this.customer.Address || '';
    this.loadProducts();
    this.FilterOrders(); // Load existing orders
  }

  loadProducts() {
    this.http.getData('products?active=1').then((r: any) => {
      this.products = r || [];
      console.log('Loaded products:', this.products);

      // Debug: Check if products have price fields
      if (this.products.length > 0) {
        console.log('Sample product structure:', this.products[0]);
        const priceFields = Object.keys(this.products[0]).filter(key =>
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('rate') ||
          key.toLowerCase().includes('sprice')
        );
        console.log('Available price-related fields:', priceFields);
      }
    }).catch(error => {
      console.error('Error loading products:', error);
      this.myToaster.Error('Failed to load products', 'Error');
    });
  }

  // Orders listing methods
  FilterOrders() {
    let filter = `OrderDate between '${JSON2Date(this.Filter.FromDate)}' and '${JSON2Date(this.Filter.ToDate)}'`;

    if (this.customer && this.customer.CustomerID) {
      filter += ` and CustomerID=${this.customer.CustomerID}`;
    }

    if (this.Filter.Status) {
      filter += ` and Status='${this.Filter.Status}'`;
    }

    const fields = 'OrderID,OrderDate,DeliveryDate,CustomerName,ProductName,Quantity,Rate,Total,Status';

    this.http
      .getData(`qryorders?orderby=OrderDate desc,OrderID&flds=${fields}&filter=${filter}`)
      .then((r: any) => {
        this.ordersData = r || [];
      })
      .catch(error => {
        console.error('Error loading orders:', error);
        this.myToaster.Error('Failed to load orders', 'Error');
      });
  }

  OrderActionClicked(event: any) {
    if (event.action === 'change-status') {
      this.selectedOrder = event.data;
      this.newStatus = this.selectedOrder.Status;
      $('#statusModal').modal('show');
    }
  }

  UpdateOrderStatus() {
    if (!this.newStatus || this.newStatus === this.selectedOrder.Status) {
      this.myToaster.Error('Please select a different status', 'Validation Error');
      return;
    }

    const updateData = {
      OrderID: this.selectedOrder.OrderID,
      Status: this.newStatus
    };

    this.http.postData('orders/update-status', updateData).then((result: any) => {
      this.myToaster.Sucess('Order status updated successfully', 'Status Updated');
      $('#statusModal').modal('hide');
      this.FilterOrders(); // Refresh the orders list
    }).catch(error => {
      console.error('Status update error:', error);
      this.myToaster.Error('Failed to update order status', 'Error');
    });
  }

  addItem() {
    this.order.Items.push({
      ProductID: '',
      ProductName: '',
      Quantity: 1,
      Rate: 0,
      Total: 0
    });
  }

  removeItem(index: number) {
    if (this.order.Items.length > 1) {
      this.order.Items.splice(index, 1);
    }
  }

  onProductChange(item: any) {
    console.log('Product change triggered for item:', item);

    if (!item.ProductID) {
      // Clear item data if no product selected
      item.ProductName = '';
      item.Rate = 0;
      this.calculateItemTotal(item);
      return;
    }

    const product = this.products.find(p => p.ProductID == item.ProductID);
    console.log('Found product:', product);

    if (product) {
      item.ProductName = product.ProductName || '';
      item.Rate = parseFloat(product.SPrice) || product.Rate || 0;
      console.log('Applied rate:', item.Rate);
      this.calculateItemTotal(item);
    } else {
      console.warn('Product not found for ID:', item.ProductID);
      item.ProductName = '';
      item.Rate = 0;
      this.calculateItemTotal(item);
    }
  }

  calculateItemTotal(item: any) {
    item.Total = (item.Quantity || 0) * (item.Rate || 0);
  }

  getOrderTotal(): number {
    return this.order.Items.reduce((total, item) => total + (item.Total || 0), 0);
  }

  getTotalItems(): number {
    return this.order.Items.reduce((total, item) => total + (item.Quantity || 0), 0);
  }

  resetForm() {
    this.order = {
      CustomerID: this.customer.CustomerID,
      DeliveryDate: GetDateJSON(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      DeliveryAddress: this.customer.Address || '',
      Notes: '',
      Items: [
        {
          ProductID: '',
          ProductName: '',
          Quantity: 1,
          Rate: 0,
          Total: 0
        }
      ]
    };
  }

  submitOrder() {
    if (this.getOrderTotal() <= 0) {
      this.myToaster.Error('Please add at least one item with valid quantity and rate', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    const orderData = {
      ...this.order,
      OrderDate: GetDateJSON(new Date()),
      Status: 'Pending',
      TotalAmount: this.getOrderTotal(),
      TotalItems: this.getTotalItems()
    };

    this.http.postData('customer_orders', orderData).then((result: any) => {
      this.myToaster.Sucess('Order placed successfully! Order ID: ' + result.OrderID, 'Order Confirmed');
      this.orderPlaced.emit(orderData);
      this.resetForm();
      this.FilterOrders(); // Refresh orders list
    }).catch(error => {
      console.error('Order submission error:', error);
      this.myToaster.Error('Failed to place order. Please try again.', 'Error');
    }).finally(() => {
      this.isSubmitting = false;
    });
  }
}
