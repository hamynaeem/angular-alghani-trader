import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import Swal from 'sweetalert2';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { JSON2Date, getYMDDate } from '../../../factories/utilities';

@Component({
  selector: 'app-customer-order-history',
  templateUrl: './customer-order-history.component.html',
  styleUrls: ['./customer-order-history.component.scss'],
})
export class CustomerOrderHistoryComponent implements OnInit, OnChanges {
  @Input() customerId: string = '';
  @Input() selectedDate: any = null;
  @Input() cardClass: string = 'border-0';
  @Input() hideHeader: boolean = false;
  @Input() headerTitle: string = 'Order History';
  @Output() OrderSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() OrdersTotal: EventEmitter<number> = new EventEmitter<number>();

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
      // Status column removed per UI request
    ],
    Actions: [],
    Data: [],
  };

  constructor(private http: HttpBase, private myToaster: MyToastService) {}

  ngOnInit() {
    if (this.customerId) {
      this.loadOrders();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const customerChanged = changes['customerId'] && !changes['customerId'].firstChange;
    const dateChanged = changes['selectedDate'] && !changes['selectedDate'].firstChange;
    if (customerChanged || dateChanged) {
      this.loadOrders();
    }
  }

  rowClicked(event: any) {
    if (event && event.data) {
      this.OrderSelected.emit(event.data);
    }
  }

  loadOrders() {
    if (!this.customerId) {
      this.orders = [];
      return;
    }

    this.loading = true;
    let filter = `CustomerID=${this.customerId}`;

    // determine date filter: use selectedDate if provided, otherwise today
    let dateStr: string | null = null;
    if (this.selectedDate) {
      if (typeof this.selectedDate === 'string') {
        dateStr = this.selectedDate;
      } else if (this.selectedDate.year && this.selectedDate.month && this.selectedDate.day) {
        dateStr = JSON2Date(this.selectedDate);
      } else {
        dateStr = getYMDDate(this.selectedDate);
      }
    } else {
      dateStr = getYMDDate();
    }

    if (dateStr) {
      filter += ` and OrderDate='${dateStr}'`;
    }

    this.http
      .getData(`qryorders?filter=${filter}&orderby=OrderDate desc`)
      .then((orders: any) => {
        this.orders = orders || [];
        // compute total of orders and emit
        try {
          const total = (this.orders || []).reduce((s: number, o: any) => {
            return s + Number(o.Amount || o.Total || o.OrderAmount || 0);
          }, 0);
          this.OrdersTotal.emit(total);
        } catch (e) {
          this.OrdersTotal.emit(0);
        }
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

