import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import Swal from 'sweetalert2';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-customer-order-history',
  templateUrl: './customer-order-history.component.html',
  styleUrls: ['./customer-order-history.component.scss'],
})
export class CustomerOrderHistoryComponent implements OnInit, OnChanges {
  @Input() customerId: string = '';

  public orders: any[] = [];
  public loading: boolean = false;

  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'Order No',
        fldName: 'OrderID',
      },
      {
        label: 'Order Date',
        fldName: 'OrderDate',
        type: 'date',
      },
      {
        label: 'Delivery Date',
        fldName: 'DeliveryDate',
        type: 'date',
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
        type: 'currency',
      },
      {
        label: 'Status',
        fldName: 'Status',
        button: {
          style: 'badge',
          callback: this.getStatusBadgeClass.bind(this),
        },
      },
    ],
    Actions: [
      {
        action: 'cancel',
        label: 'Cancel Order',
        icon: 'fa fa-times-circle',
        class: 'btn-warning btn-sm',
        condition: (data: any) =>
          data.Status?.toLowerCase() === 'pending' ||
          data.Status?.toLowerCase() === 'approved'
      },
      {
        action: 'delete',
        label: 'Delete',
        icon: 'fa fa-trash',
        class: 'btn-danger btn-sm',
        condition: (data: any) => data.Status?.toLowerCase() === 'pending'
      },
    ],
    Data: [],
  };

  constructor(private http: HttpBase, private myToaster: MyToastService) {}

  ngOnInit() {
    if (this.customerId) {
      this.loadOrders();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerId'] && !changes['customerId'].firstChange) {
      this.loadOrders();
    }
  }

  loadOrders() {
    if (!this.customerId) {
      this.orders = [];
      return;
    }

    this.loading = true;
    const filter = `CustomerID=${this.customerId}`;

    this.http
      .getData(`qryorders?filter=${filter}&orderby=OrderDate desc`)
      .then((orders: any) => {
        this.orders = orders || [];
      })
      .catch((error) => {
        console.error('Error loading orders:', error);
        this.myToaster.Error('Failed to load order history', 'Error');
        this.orders = [];
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onAction(event: any) {
    const { action, data } = event;

    switch (action) {
      case 'delete':
        this.deleteOrder(data);
        break;
      case 'cancel':
        this.cancelOrder(data);
        break;
    }
  }

  deleteOrder(order: any) {
    // Check if order can be deleted
    if (order.Status?.toLowerCase() !== 'pending') {
      this.myToaster.Error('Only pending orders can be deleted', 'Action Not Allowed');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete Order #${order.OrderID}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .Delete('orders', order.OrderID)
          .then(() => {
            this.myToaster.Sucess(
              `Order #${order.OrderID} deleted successfully`,
              'Order Deleted'
            );
            this.loadOrders(); // Refresh the list
          })
          .catch((error) => {
            console.error('Delete order error:', error);
            this.myToaster.Error(
              'Failed to delete order. Please try again.',
              'Error'
            );
          });
      }
    });
  }

  cancelOrder(order: any) {
    // Check if order can be cancelled
    const canCancel = order.Status?.toLowerCase() === 'pending' ||
                     order.Status?.toLowerCase() === 'approved';

    if (!canCancel) {
      this.myToaster.Error('Only pending or approved orders can be cancelled', 'Action Not Allowed');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `This will cancel Order #${order.OrderID}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Order',
      cancelButtonText: 'Keep Order',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .postData(`orders/update-status`, {
            OrderID: order.OrderID,
            Status: 'Cancelled'
          })
          .then(() => {
            this.myToaster.Sucess(
              `Order #${order.OrderID} cancelled successfully`,
              'Order Cancelled'
            );
            this.loadOrders(); // Refresh the list
          })
          .catch((error) => {
            console.error('Cancel order error:', error);
            this.myToaster.Error(
              'Failed to cancel order. Please try again.',
              'Error'
            );
          });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
      case 'confirmed':
        return 'badge-confirmed';
      case 'processing':
        return 'badge-processing';
      case 'shipped':
        return 'badge-shipped';
      case 'delivered':
      case 'completed':
        return 'badge-delivered';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-light';
    }
  }
}

