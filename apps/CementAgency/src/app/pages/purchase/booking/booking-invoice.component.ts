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
  public AllProducts: any = [];   // full unfiltered product list — never mutate this
  public SelectedProduct: any = {};
  public bookData: BookingDetail[] = [];
  public saleData: SaleDetail[] = [];
  public Stores: any = [];
  public Customers: any = [];
  public Suppliers: any = [];
  // UI debug helper to show stock maps on the page
  public showStockDebug = false;

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
    const s = this.Suppliers.find((x: any) => x.SupplierID == supplierID);
    return s ? s.SupplierName : '';
  }

  // Returns bags contributed by in-memory purchase items for this product.
  // Only used for NEW bookings (EditID === '') — when editing, DB already has these rows.
  private getInMemoryPurchaseBags(pid: string): number {
    return (this.bookData || [])
      .filter((item: any) => String(item.ProductID) === pid)
      .reduce((acc: number, item: any) =>
        acc + (Number(item.Qty) || 0) * (Number(item.Packing) > 0 ? Number(item.Packing) : 1), 0);
  }

  applyStockToProducts() {
    const source = (this.AllProducts && this.AllProducts.length) ? this.AllProducts : this.Products;
    this.Products = source.map((p: any) => {
      const dbStock = this.PostedStockMap[String(p.ProductID)] || 0;
      const inMemoryBags = !this.EditID ? this.getInMemoryPurchaseBags(String(p.ProductID)) : 0;
      const effectiveStock = Math.max(0, dbStock + inMemoryBags);
      return {
        ...p,
        Stock: effectiveStock,
        disabled: effectiveStock <= 0,
      };
    });
    try {
      // Log per-product mapping to help debug mismatches between DB rows and product list
      this.Products.forEach((p: any) => {
        console.debug('applyStockToProducts:', {
          ProductID: p.ProductID,
          ProductName: p.ProductName,
          Stock: p.Stock,
          PostedKeyValue: this.PostedStockMap[String(p.ProductID)],
        });
      });
    } catch (e) {
      // ignore console errors
    }
  }

  getStock(productID: any): number {
    if (productID === null || productID === undefined) return 0;
    const dbStock = this.getPostedStockValue(productID);
    // For new (unsaved) bookings, also count in-memory purchase items
    const inMemoryBags = !this.EditID ? this.getInMemoryPurchaseBags(String(productID)) : 0;
    return Math.max(0, dbStock + inMemoryBags);
  }

  // Robust lookup: try trimmed string key, numeric key, and original
  private getPostedStockValue(idOrProduct: any): number {
    const tryKeys: string[] = [];
    const pid = idOrProduct && idOrProduct.ProductID ? idOrProduct.ProductID : idOrProduct;
    const raw = pid === null || pid === undefined ? '' : String(pid);
    tryKeys.push(raw);
    const trimmed = raw.trim();
    if (trimmed !== raw) tryKeys.push(trimmed);
    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum)) tryKeys.push(String(asNum));

    for (const k of tryKeys) {
      if (k in this.PostedStockMap) {
        return this.PostedStockMap[k] || 0;
      }
    }

    // Fallback: try to match by ProductName (some DBs may store product as name)
    try {
      const pname = idOrProduct && idOrProduct.ProductName ? idOrProduct.ProductName : null;
      if (pname) {
        for (const key of Object.keys(this.PostedStockMap)) {
          if (String(key).toLowerCase() === String(pname).toLowerCase()) {
            return this.PostedStockMap[key] || 0;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return 0;
  }

  public StockMap: { [productID: string]: number } = {};
  public PostedStockMap: { [productID: string]: number } = {};

  // Refresh stock map via direct SQL on booking_details:
  // Type=1 = purchase, Qty in tons, Packing stored (default 20) → bags = Qty × Packing
  // Type=2 = sale, Qty already in bags, Packing not stored
  private buildStockFromSql(): Promise<void> {
    const netSql = `SELECT bd.ProductID,
      SUM(CASE WHEN bd.Type=1 THEN bd.Qty * IFNULL(bd.Packing,20) ELSE 0 END) AS PurchaseBags,
      SUM(CASE WHEN bd.Type=2 THEN bd.Qty ELSE 0 END) AS SaleBags
      FROM booking_details bd
      GROUP BY bd.ProductID`;
    return this.http.getData('MQRY?qrysql=' + encodeURIComponent(netSql))
      .then((rows: any) => {
        this.PostedStockMap = {};
        this.StockMap = {};
        (rows || []).forEach((r: any) => {
          const rawPid = r.ProductID;
          const pidStr = rawPid === null || rawPid === undefined ? '' : String(rawPid);
          const pidTrim = pidStr.trim();
          const purchase = Number(r.PurchaseBags) || 0;
          const sale = Number(r.SaleBags) || 0;
          const net = Math.max(0, purchase - sale);

          // store under multiple normalized keys to avoid lookup mismatches
          this.PostedStockMap[pidStr] = net;
          if (pidTrim !== pidStr) this.PostedStockMap[pidTrim] = net;
          const asNum = Number(pidTrim);
          if (!Number.isNaN(asNum)) this.PostedStockMap[String(asNum)] = net;

          this.StockMap[pidStr] = net;
        });
        // Debug logging to help investigate mismatched stock counts
        try {
          console.debug('buildStockFromSql - raw rows:', rows);
          console.debug('buildStockFromSql - PostedStockMap:', this.PostedStockMap);
          console.debug('buildStockFromSql - StockMap:', this.StockMap);
        } catch (e) {
          // ignore console errors in old browsers
        }
        this.applyStockToProducts();
      })
      .catch(() => this.applyStockToProducts());
  }

  refreshStock() {
    this.buildStockFromSql();
  }

  toggleStockDebug() {
    this.showStockDebug = !this.showStockDebug;
  }

  ngOnInit() {
    this.Cancel();
    Promise.all([
      this.http.getData('products?orderby=ProductName'),
    ]).then(([products]: any[]) => {
      this.AllProducts = (products || []).filter((p: any) => p && (p.ProductName || p.ProductID));
      this.applyStockToProducts();
      // Load real stock from DB
      this.buildStockFromSql();
    }).catch(() => {
      this.http.getData('products?orderby=ProductName').then((products: any[]) => {
        this.AllProducts = (products || []).filter((p: any) => p && (p.ProductName || p.ProductID));
        this.Products = this.AllProducts.map((p: any) => ({ ...p, Stock: 0 }));
      });
    });
    this.cachedData.Accounts$.subscribe((accounts: any[]) => {
      this.Customers = accounts.filter(
        (c) => c.AcctType.toUpperCase() === 'CUSTOMERS'
      );
    });
    this.cachedData.updateSuppliers();
    this.cachedData.Suppliers$.subscribe((suppliers: any[]) => {
      this.Suppliers = suppliers || [];
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
          .then((r: any) => {
            console.log(r);

            this.myToaster.Sucess('Booking saved successfully.', 'Success');
            this.saleData = [];
            this.bookData = [];
            this.calcBooking();
            this.calcSaleData();
            this.Cancel();
            this.EditID = '';

            // Auto-post the booking so stock is updated immediately.
            // Booking POST returns { id: <BookingID> }
            const bookingId = r && (r.id || r.bookingID || r.BookingID);
            if (bookingId) {
              this.http.postTask('postbooking/' + bookingId, {})
                .then(() => {
                  // Refresh posted-stock map after posting
                  setTimeout(() => this.refreshStock(), 500);
                  try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
                })
                .catch(() => {
                  // ignore post errors here; UI still continues
                });
            } else {
              // If no id returned, still refresh stock (best-effort)
              this.refreshStock();
              try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
            }

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
        this.Suppliers.find((s: any) => s.SupplierID === this.booking?.SupplierID)
          ?.SupplierName || '',
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
    this.applyStockToProducts();
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
      this.applyStockToProducts();
    }
  }
  deleteItem(index: number) {
    if (index > -1 && index < this.bookData.length) {
      this.bookData.splice(index, 1);
      this.calcBooking();
      this.applyStockToProducts();
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

    // Stock validation: total qty already added for this product + new qty must not exceed available stock
    const availableStock = this.getStock(this.saleDetail.ProductID);
    const alreadyAdded = this.saleData
      .filter((item: any) => String(item.ProductID) === String(this.saleDetail.ProductID))
      .reduce((acc: number, item: any) => acc + item.Qty * 1, 0);
    const totalRequested = alreadyAdded + this.saleDetail.Qty * 1;
    if (totalRequested > availableStock) {
      this.myToaster.Error(
        `Not enough stock! Available: ${availableStock} bags, Already added: ${alreadyAdded}, Requested: ${this.saleDetail.Qty}.`,
        'Insufficient Stock'
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
    this.applyStockToProducts();
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
      (acc, item) => acc + item.Qty * 1,
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
                      this.Suppliers.find((s: any) => s.SupplierID == (it.SupplierID || this.booking?.SupplierID))?.SupplierName ||
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
    this.applyStockToProducts();
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
