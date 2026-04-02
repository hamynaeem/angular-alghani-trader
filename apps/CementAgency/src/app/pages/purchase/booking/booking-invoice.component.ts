import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ButtonsBarComponent } from '../../../../../../../libs/future-tech-lib/src/lib/components/buttons-bar/buttons-bar.component';
import {
  getCurDate,
  GetDateJSON,
  JSON2Date,
} from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { PrintDataService } from '../../../services/print.data.services';
interface Booking {
  Date: any;
  DtCr: string;
  InvoiceNo?: string;
  VehicleNo?: string;
  CofNo?: string;
  ReceiptNo?: string;
  BuiltyNo?: string;
  BagsPurchase?: number;
  BagsSold?: number;
  SupplierID?: string;
  Amount?: number;
  Carriage?: number;
  NetAmount?: number;
}

interface BookingDetail {
  ProductID?: string;
  ProductName: string;
  Qty: number;
  Price: number;
  Amount: number;
  NetAmount?: number;
  Carriage?: number;
  Packing: number;
}

interface Sale {
  TotalAmount?: number;
  Discount?: number;
  NetAmount?: number;
  Received?: number;
  Credit?: number;
}

interface SaleDetail {
  CustomerID?: string;
  ProductID?: string;
  Qty: number;
  Price: number;
  Discount: number;
  MRP: number;
  Received: number;
  Amount: number;
  ProductName?: string;
  CustomerName?: string;
  OrderID?: string;
  Packing?: number;
  DeliveryCity?: string;
}

@Component({
  selector: 'app-booking-invoice',
  templateUrl: './booking-invoice.component.html',
  styleUrls: ['./booking-invoice.component.scss'],
})
export class BookingInvoiceComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() Type!: string;
  @Input() EditID = '';

  selectedProduct: any;
  @ViewChild('fromBooking') fromBooking!: { valid: boolean };
  @ViewChild('cmbProduct') cmbProd!: { focus: () => void };
  @ViewChild('qty') elQty!: any;
  @ViewChild('cmbCustomers') cmbCustomers!: { focus: () => void };
  @ViewChild('btnBar') btnBar!: ButtonsBarComponent;
  @ViewChild('ordersModalTemplate') ordersModalTemplate!: TemplateRef<any>;

  public data = new LocalDataSource([]);
  Ino = '';
  tqty: any = '';
  public btnsave = false;
  public isPosted = false;

  // Modal reference
  modalRef?: BsModalRef;

  public booking!: Booking;
  bookingDetail!: BookingDetail;

  sale!: Sale;
  saleDetail!: SaleDetail;

  public Products: any = [];
  public SelectedProduct: any = {};
  public bookData: BookingDetail[] = [];
  public saleData: SaleDetail[] = [];
  public Stores: any = [];
  public Customers: any = [];
  public Suppliers: any = [];

  // Orders modal properties
  public confirmedOrders: any[] = [];
  public loadingOrders: boolean = false;
  // If arrived with a confirmedOrderID in query params, auto-select it
  public autoSelectOrderID: string | null = null;

  $Companies: any;
  AcctTypes: any;
  SelectCust: any = {};
  btnLocked: boolean = true;

  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private myToaster: MyToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private ps: PrintDataService
  ) {
    this.AcctTypes = this.cachedData.AcctTypes$;
    this.$Companies = this.cachedData.Stores$;
  }

  getSupplierName(supplierID: any): string {
    if (!supplierID) return '';
    const s = this.Suppliers.find((x: any) => x.CustomerID == supplierID);
    return s ? s.CustomerName : '';
  }

  ngOnInit() {
    this.Cancel();
    this.cachedData.Products$.subscribe((products: any[]) => {
      // ensure only product-like items are assigned (filter out accounts/customers accidentally returned)
      this.Products = (products || []).filter((p: any) => p && (p.ProductName || p.ProductID));
    });
    this.cachedData.Accounts$.subscribe((accounts: any[]) => {
      this.Customers = accounts.filter(
        (c) => c.AcctType.toUpperCase() === 'CUSTOMERS'
      );
      this.Suppliers = accounts.filter(
        (c) => c.AcctType.toUpperCase() === 'SUPPLIERS'
      );
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.EditID) {
        this.EditID = params.EditID;

        this.LoadInvoice();
      }
    });

    // Check for query params to auto-select an order
    this.activatedRoute.queryParams.subscribe((q: Params) => {
      if (q && q.confirmedOrderID) {
        this.autoSelectOrderID = q.confirmedOrderID;
      }
    });
  }

  Cancel() {
    this.saleDetail = {
      Qty: 0,
      Price: 0,
      Discount: 0,
      MRP: 0,
      Received: 0,
      Amount: 0,
      DeliveryCity: ''
    };
    this.bookingDetail = {
      Qty: 0,
      Price: 0,
      Amount: 0,
      ProductName: '',
      Packing: 0,
    };
    this.booking = {
      DtCr: 'CR',
      Date: GetDateJSON(new Date(getCurDate())),
      BagsPurchase: 0,
      BagsSold: 0,
      Amount: 0,
      Carriage: 0,
      NetAmount: 0,
    };
    this.sale = {
      TotalAmount: 0,
      Discount: 0,
      NetAmount: 0,
      Received: 0,
      Credit: 0,
    };
  }
  ngOnChanges(_changes: SimpleChanges) {}
  ngAfterViewInit(): void {}
  SaveData() {
    return new Promise((resolve, reject) => {
    if (!this.booking || !this.bookData.length) {
      this.myToaster.Error(
        'Booking and booking details are required.',
        'Validation Error'
      );
      return reject('Validation Error');
    }

      if (this.fromBooking.valid) {
        // Save booking data
        const data = {
          ...this.booking,
          details: this.bookData,
          sales: this.saleData,
        };

        data.Date = JSON2Date(data.Date);

        this.http
          .postTask(
            'booking' + (this.EditID != '' ? '/' + this.EditID : ''),
            data
          )
          .then((r) => {
            console.log(r);

            this.myToaster.Sucess('Booking saved successfully.', 'Success');
            this.saleData = [];
            this.bookData = [];
            this.calcBooking();
            this.calcSaleData();
            this.Cancel();
            this.EditID = '';
            this.router.navigateByUrl('/purchase/booking');
            resolve(r);
          })
          .catch((_err) => {
            this.myToaster.Error('Failed to save booking.', 'Error');
            reject(_err);
          });
      } else {
        this.myToaster.Error(
          'Please fill all required fields.',
          'Validation Error'
        );
        return reject('Validation Error');
      }
    });
  }

  FindINo() {
    this.router.navigate(['/purchase/invoice/', this.Ino]);
  }
  addItem() {
    if (
      !this.bookingDetail.ProductID ||
      this.bookingDetail.Qty <= 0 ||
      this.bookingDetail.Price <= 0
    ) {
      this.myToaster.Error(
        'Please select a product and enter valid quantity and price.',
        'Validation Error'
      );
      return;
    }

    const product = this.Products.find(
      (p: any) => p.ProductID === this.bookingDetail.ProductID
    );
    const packing = product?.Packing || 1;

    const newItem = {
      ProductID: this.bookingDetail.ProductID,
      ProductName: product?.ProductName || '',
      SupplierID: this.booking?.SupplierID || '',
      SupplierName:
        this.Suppliers.find((s: any) => s.CustomerID === this.booking?.SupplierID)
          ?.CustomerName || '',
      Qty: this.bookingDetail.Qty,
      Price: this.bookingDetail.Price,
      Packing: packing,
      Amount: this.bookingDetail.Qty * this.bookingDetail.Price,
    };
    this.bookData.push(newItem);

    // Auto-add the same item to sales details
    const saleItem = {
      ProductID: this.bookingDetail.ProductID,
      ProductName: product?.ProductName || '',
      Packing: 1,
      Qty: newItem.Qty * packing, // Use total bags as quantity
      Discount: 0,
      MRP: 0,
      Received: 0,
      Price: 0, // User will enter price
      Amount: 0, // User will enter amount
      CustomerID: this.saleDetail?.CustomerID || '',
      OrderID: this.saleDetail?.OrderID || '0',
      DeliveryCity: this.saleDetail?.DeliveryCity || '',
      CustomerName:
        this.Customers.find(
          (c: any) => c.CustomerID === this.saleDetail?.CustomerID
        )?.CustomerName || '',
    };

    // Don't auto-add to saleData - only update form fields
    // User will manually click "Add" button to add to sales table

    // Keep product in sync, but let user enter sale qty manually.
    this.saleDetail = {
      ...this.saleDetail,
      ProductID: this.bookingDetail.ProductID,
      ProductName: product?.ProductName || '',
    };

    this.calcBooking();
    this.calcSaleData();
    this.bookingDetail.ProductID = undefined;
    this.bookingDetail.Qty = 0;
    this.bookingDetail.Price = 0;
    this.cmbProd.focus();
  }
  
  onBookingProductChange(event: any) {
    // event from ng-select is usually the selected item object; if bindValue
    // was used and a primitive arrives, try to resolve it from Products.
    const product =
      event && event.ProductID
        ? event
        : this.Products.find((p: any) => p.ProductID === event) || {};
    this.selectedProduct = product || {};

    // ensure saleDetail exists
    if (!this.saleDetail) {
      this.saleDetail = {
        Qty: 0,
        Price: 0,
        Discount: 0,
        MRP: 0,
        Received: 0,
        Amount: 0,
      } as SaleDetail;
    }

    // sync selected product into sale form for convenience
    this.saleDetail.ProductID = product?.ProductID;
    this.saleDetail.ProductName = product?.ProductName;
    // prefer explicit product price if present
    if (product && product.Price != null) {
      this.saleDetail.Price = product.Price;
    }
  }
  removeItem() {
    if (this.bookData.length > 0) {
      this.bookData.pop();
    }
  }
  deleteItem(index: number) {
    if (index > -1 && index < this.bookData.length) {
      this.bookData.splice(index, 1);
      this.calcBooking();
    }
  }
  calcBooking() {
    this.booking.Amount = this.bookData.reduce(
      (acc, item) => acc + item.Amount * 1,
      0
    );
    this.booking.NetAmount =
      this.booking.Amount + (this.booking.Carriage ?? 0) * 1;

    // `item.Packing` already represents number of bags per booking unit.
    // So BagsPurchase is Qty * Packing (no extra *20 multiplier).
    this.booking.BagsPurchase = this.bookData.reduce(
      (acc, item) => acc + item.Qty * (item.Packing ? item.Packing : 1),
      0
    );
  }
  addSaleItem() {
    if (
      !this.saleDetail.ProductID ||
      this.saleDetail.Qty <= 0 ||
      this.saleDetail.Price <= 0
    ) {
      this.myToaster.Error(
        'Please select a product and enter valid quantity and price.',
        'Validation Error'
      );
      return;
    }

    const product = this.Products.find(
      (p: any) => p.ProductID === this.saleDetail.ProductID
    );
    const packing = product?.Packing || 1;

    const saleItem = {
      ProductID: this.saleDetail.ProductID,
      ProductName: product?.ProductName || '',
      Packing: packing,
      Qty: this.saleDetail.Qty,
      Discount: this.saleDetail.Discount,
      MRP: this.saleDetail.MRP,
      Received: this.saleDetail.Received,
      Price: this.saleDetail.Price,
      Amount: this.saleDetail.Qty * this.saleDetail.Price,
      CustomerID: this.saleDetail.CustomerID || '',
      OrderID: this.saleDetail.OrderID || '0',
      DeliveryCity: this.saleDetail.DeliveryCity || '',
      CustomerName:
        this.Customers.find(
          (c: any) => c.CustomerID === this.saleDetail.CustomerID
        )?.CustomerName || '',
    };

    if (!this.saleData) {
      this.saleData = [];
    }
    this.saleData.push(saleItem);
    this.calcSaleData();
    this.cmbCustomers.focus();
    this.saleDetail.ProductID = undefined;
    this.saleDetail.Qty = 0;
    this.saleDetail.Price = 0;
    this.saleDetail.Amount = 0;
    this.saleDetail.CustomerID = undefined;
  }
  calcSaleData() {
    this.sale.TotalAmount = this.saleData.reduce(
      (acc, item) => acc + item.Amount * 1,
      0
    );
    this.sale.Received = this.saleData.reduce(
      (acc, item) => acc + (item.Received ?? 0) * 1,
      0
    );
    this.sale.Discount = this.saleData.reduce(
      (acc, item) => acc + (item.Discount ?? 0) * 1,
      0
    );
    this.sale.NetAmount =
      (this.sale.TotalAmount ?? 0) - (this.sale.Discount ?? 0) * 1;
    this.sale.Credit =
      (this.sale.NetAmount ?? 0) - (this.sale.Received ?? 0) * 1;
    this.booking.BagsSold = this.saleData.reduce(
      (acc, item) => acc + item.Qty,
      0
    );

  }
  saveAndPrint() {
    // Clone the print section BEFORE saving (SaveData clears data and navigates away)
    const salePrintEl = document.getElementById('sale-print-section');
    let clone: HTMLElement | null = null;
    if (salePrintEl) {
      clone = salePrintEl.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
    }
    const printTitle = 'Sale Invoice';
    const printSubTitle = this.booking.InvoiceNo || '';
    const printSaleDetails = [...this.saleData];

    this.SaveData()
      .then(() => {
        this.ps.PrintData.HTMLData = clone;
        this.ps.PrintData.Title = printTitle;
        this.ps.PrintData.SubTitle = printSubTitle;
        this.ps.PrintData.SaleDetails = printSaleDetails;
        this.router.navigateByUrl('/print/print-html');
      })
      .catch((err) => {
        // already handled in SaveData
      });
  }
  LoadInvoice() {
    if (this.EditID == '') {
      return;
    }
    this.http.getData('booking/' + this.EditID).then((r: any) => {
      if (r) {
        r.Date = GetDateJSON(new Date(r.Date));
        this.booking = r;
        if (r.IsPosted == 1) {
          this.myToaster.Error('Can not edit posted invoice', 'Edit', 1);
          this.router.navigateByUrl('/purchase/booking');
          return;
        }
        this.http
          .getData('qrybookingpurchase', {
            filter: 'BookingID = ' + this.EditID,
          })
          .then((d: any) => {
            if (d) {
                  // ensure supplier name is present on each item for display
                  this.bookData = (d || []).map((it: any) => ({
                    ...it,
                    SupplierID: it.SupplierID || this.booking?.SupplierID || '',
                    SupplierName:
                      it.SupplierName ||
                      this.Suppliers.find((s: any) => s.CustomerID == (it.SupplierID || this.booking?.SupplierID))?.CustomerName ||
                      '',
                  }));
              this.calcBooking();
            }
          });
        this.http
          .getData('qrybookingsale', { filter: 'BookingID = ' + this.EditID })
          .then((d: any) => {
            if (d) {
              this.saleData = d;
              this.calcSaleData();
            }
          });
        this.myToaster.Sucess('Invoice Loaded Successfully', 'Edit', 1);
      } else {
        this.myToaster.Warning('Invoice Not Found', 'Edit', 1);
        this.router.navigateByUrl('/purchase/booking');
      }
    });
  }
  deleteSaleItem(idx: number){
    this.saleData.splice(idx, 1);
    this.calcSaleData();
  }
  LoadOrders() {
    this.loadingOrders = true;
    this.confirmedOrders = [];

    // Load confirmed orders from qryorders table
    const filter = "Status='Confirmed'";
    const fields = 'OrderID,OrderDate,CustomerID,CustomerName,ProductID,ProductName,Quantity,Rate,Total,DeliveryAddress';

    this.http.getData(`qryorders?filter=${filter}&flds=${fields}&orderby=OrderDate desc`)
      .then((orders: any) => {
        const serverOrders = orders || [];

        // Merge local unsynced orders so manually added orders appear in modal
        try {
          const raw = localStorage.getItem('local_orders');
          const local = raw ? JSON.parse(raw) : [];
          // Append local orders that are not already present (by OrderID)
          const byId: any = {};
          (serverOrders || []).forEach((s: any) => (byId[s.OrderID] = s));
          (local || []).forEach((l: any) => {
            if (!byId[l.OrderID]) {
              // map local entry to server-like shape
              byId[l.OrderID] = {
                OrderID: l.OrderID,
                OrderDate: l.OrderDate,
                CustomerID: l.CustomerID || null,
                CustomerName: l.CustomerName || '',
                ProductID: l.ProductID || null,
                ProductName: l.ProductName || l.ProductName || '',
                Quantity: l.Quantity || 0,
                Rate: l.Rate || 0,
                Total: l.Total || 0,
                DeliveryAddress: l.DeliveryAddress || '',
                _unsynced: true,
                Status: l.Status || 'Pending'
              };
            }
          });

          this.confirmedOrders = Object.keys(byId).map((k) => byId[k]).sort((a: any,b:any)=> (new Date(b.OrderDate).getTime()||0)-(new Date(a.OrderDate).getTime()||0));
        } catch (e) {
          console.warn('Failed to merge local orders into confirmedOrders', e);
          this.confirmedOrders = serverOrders;
        }

        // Show the modal using BsModalService
        this.modalRef = this.modalService.show(this.ordersModalTemplate, {
          class: 'modal-lg',
          backdrop: 'static',
          keyboard: false
        });

        // If we were asked to auto-select a specific order, do that now
        if (this.autoSelectOrderID) {
          const orderToSelect = (this.confirmedOrders || []).find(o => o.OrderID == this.autoSelectOrderID);
          if (orderToSelect) {
            // small timeout to ensure modal is visible before selecting
            setTimeout(() => {
              this.selectOrder(orderToSelect);
            }, 50);
          }
          this.autoSelectOrderID = null;
        }
      })
      .catch((error) => {
        console.error('Error loading confirmed orders:', error);
        this.myToaster.Error('Failed to load confirmed orders', 'Error');
        // Try to show any local unsynced orders so user can still select them
        try {
          const raw = localStorage.getItem('local_orders');
          const local = raw ? JSON.parse(raw) : [];
          this.confirmedOrders = (local || []).map((l: any) => ({
            OrderID: l.OrderID,
            OrderDate: l.OrderDate,
            CustomerID: l.CustomerID || null,
            CustomerName: l.CustomerName || '',
            ProductID: l.ProductID || null,
            ProductName: l.ProductName || '',
            Quantity: l.Quantity || 0,
            Rate: l.Rate || 0,
            Total: l.Total || 0,
            DeliveryAddress: l.DeliveryAddress || '',
            _unsynced: true,
            Status: l.Status || 'Pending'
          }));
          // Show modal even if server failed
          this.modalRef = this.modalService.show(this.ordersModalTemplate, {
            class: 'modal-lg',
            backdrop: 'static',
            keyboard: false
          });
        } catch (e) {
          console.warn('Failed to load local orders for booking modal', e);
          this.confirmedOrders = [];
        }
      })
      .finally(() => {
        this.loadingOrders = false;
      });
  }

  selectOrder(order: any) {
    try {
      // Fill the sale form with selected order data
      this.saleDetail.CustomerID = order.CustomerID;
      this.saleDetail.ProductID = order.ProductID;
      this.saleDetail.OrderID = order.OrderID;
      this.saleDetail.Qty = order.Quantity;
      this.saleDetail.Price = order.Rate;
      this.saleDetail.Amount = order.Total;

      // Find and set the customer name for display
      const selectedCustomer = this.Customers.find((c: any) => c.CustomerID == order.CustomerID);
      if (selectedCustomer) {
        this.saleDetail.CustomerName = selectedCustomer.CustomerName;
      }

      // Find and set the product name for display
      const selectedProduct = this.Products.find((p: any) => p.ProductID == order.ProductID);
      if (selectedProduct) {
        this.saleDetail.ProductName = selectedProduct.ProductName;
      }

      // Try to populate delivery city: prefer explicit field, else extract from DeliveryAddress
      if (order.DeliveryCity) {
        this.saleDetail.DeliveryCity = order.DeliveryCity;
      } else if (order.DeliveryAddress) {
        const parts = (order.DeliveryAddress + '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        this.saleDetail.DeliveryCity = parts.length ? parts[parts.length - 1] : '';
      } else {
        this.saleDetail.DeliveryCity = '';
      }
      // Store the order reference for potential status updates
      this.saleDetail.OrderID = order.OrderID;

      // Close the modal
      this.modalRef?.hide();

      // Show success message
      this.myToaster.Sucess(`Order #${order.OrderID} data loaded successfully`, 'Order Selected');

    } catch (error) {
      console.error('Error selecting order:', error);
      this.myToaster.Error('Failed to load order data', 'Error');
    }
  }

  closeModal() {
    this.modalRef?.hide();
  }
}
