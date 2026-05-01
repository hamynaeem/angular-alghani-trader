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
  TransporterID?: string;
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
  // Optional filtered product list used by template
  public FilteredProducts: any[] = [];
  // Map of transport product quantities (bags) keyed by ProductID
  public TransportProductQty: { [productId: string]: number } = {};
  // Aggregate net stocks displayed in the header
  public NetStocks: number = 0;
  // Selected product's computed net stock (shown near product select)
  public SelectedProductStock: number = 0;
  public bookData: BookingDetail[] = [];
  public saleData: SaleDetail[] = [];
  public Stores: any = [];
  public Customers: any = [];
  public Suppliers: any = [];
  public Transporters: any = [];
  // When true, users must select a transport/vehicle first before choosing products
  public requireTransportFirst: boolean = true;
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
        acc + (Number(item.Qty) || 0) * (Number(item.Packing) > 0 ? Number(item.Packing) : 20), 0);
  }

  // Returns bags contributed by in-memory sale items for this product.
  private getInMemorySaleBags(pid: string): number {
    return (this.saleData || [])
      .filter((item: any) => String(item.ProductID) === pid)
      .reduce((acc: number, item: any) => acc + (Number(item.Qty) || 0), 0);
  }

  applyStockToProducts() {
    const source = (this.AllProducts && this.AllProducts.length) ? this.AllProducts : this.Products;
    // If transport must be selected first, don't populate products until transporter chosen
    if (this.requireTransportFirst && !this.hasSelectedTransport()) {
      this.Products = [];
      this.SelectedProductStock = 0;
      this.NetStocks = 0;
      return;
    }
    const mapped = source.map((p: any) => {
      // Compute effective stock as posted/net stock + in-memory purchases - in-memory sales
      const pidKey = p && p.ProductID !== undefined && p.ProductID !== null ? String(p.ProductID) : '';
      const dbNet = this.PostedStockMap[pidKey] || this.StockMap[pidKey] || this.getPostedStockValue(p);
      const inMemoryPurchaseBags = !this.EditID ? this.getInMemoryPurchaseBags(pidKey) : 0;
      const inMemorySaleBags = this.getInMemorySaleBags(pidKey);
      const effectiveStock = Math.max(0, (Number(dbNet) || 0) + inMemoryPurchaseBags - inMemorySaleBags);
      return {
        ...p,
        Stock: effectiveStock,
        // Keep products enabled so user can select/add them even when stock is zero.
        disabled: false,
        // DisplayName used by UI: show only product name
        DisplayName: p.ProductName || '',
      };
    });

    // Decide whether we have posted stock or purchase data available. If not, avoid filtering
    // so the product list isn't empty while the stock API call completes.
    const hasPostedStockData = (this.PostedStockMap && Object.keys(this.PostedStockMap).length > 0) ||
      (this.StockMap && Object.keys(this.StockMap).length > 0);
    const hasPurchaseData = this.PurchaseMap && Object.keys(this.PurchaseMap).length > 0;

    if (!this.EditID) {
      if (hasPurchaseData) {
        // For new bookings, prefer products that have purchase history
        this.Products = mapped.filter((p: any) => Number(this.PurchaseMap[String(p.ProductID)]) > 0);
      } else if (hasPostedStockData) {
        // Fallback: show only products with positive effective stock
        this.Products = mapped.filter((p: any) => Number(p.Stock) > 0);
      } else {
        // Stock/purchase data not ready yet — show full list to avoid empty dropdown
        this.Products = mapped;
      }
    } else {
      // Editing an existing booking — show full mapped list
      this.Products = mapped;
    }
    try {
      // lightweight no-op to preserve structure (removed debug logs)
    } catch (e) {
      // ignore
    }
    // Update aggregate NetStocks shown in header
    try {
      this.NetStocks = (this.Products || []).reduce((s: number, p: any) => s + (Number(p.Stock) || 0), 0);
    } catch (e) {
      this.NetStocks = 0;
    }
  }

  getStock(productID: any): number {
    if (productID === null || productID === undefined) return 0;
    const pidStr = String(productID);
    // Use net (purchase - sale) from DB stored in PostedStockMap; fall back to PurchaseMap
    const dbNet = (pidStr in this.PostedStockMap)
      ? this.PostedStockMap[pidStr]
      : (pidStr.trim() in this.PostedStockMap ? this.PostedStockMap[pidStr.trim()] : this.getPurchaseValue(productID));
    // For new (unsaved) bookings, include in-memory purchase items minus in-memory sale bags
    const inMemoryPurchaseBags = !this.EditID ? this.getInMemoryPurchaseBags(pidStr) : 0;
    const inMemorySaleBags = this.getInMemorySaleBags(pidStr);
    return Math.max(0, (Number(dbNet) || 0) + inMemoryPurchaseBags - inMemorySaleBags);
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

  // Robust lookup for purchase-only totals recorded in PurchaseMap
  private getPurchaseValue(idOrProduct: any): number {
    try {
      const tryKeys: string[] = [];
      const pid = idOrProduct && idOrProduct.ProductID ? idOrProduct.ProductID : idOrProduct;
      const raw = pid === null || pid === undefined ? '' : String(pid);
      tryKeys.push(raw);
      const trimmed = raw.trim();
      if (trimmed !== raw) tryKeys.push(trimmed);
      const asNum = Number(trimmed);
      if (!Number.isNaN(asNum)) tryKeys.push(String(asNum));

      for (const k of tryKeys) {
        if (k in this.PurchaseMap) return Number(this.PurchaseMap[k]) || 0;
      }

      const pname = idOrProduct && idOrProduct.ProductName ? idOrProduct.ProductName : null;
      if (pname) {
        for (const key of Object.keys(this.PurchaseMap)) {
          if (String(key).toLowerCase() === String(pname).toLowerCase()) {
            return Number(this.PurchaseMap[key]) || 0;
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
  public PurchaseMap: { [productID: string]: number } = {};

  // Refresh stock map via direct SQL on Purchase:
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
          // record purchase-only totals as well
          this.PurchaseMap[pidStr] = purchase;
          if (pidTrim !== pidStr) {
            this.PostedStockMap[pidTrim] = net;
            this.PurchaseMap[pidTrim] = purchase;
          }
          const asNum = Number(pidTrim);
          if (!Number.isNaN(asNum)) {
            this.PostedStockMap[String(asNum)] = net;
            this.PurchaseMap[String(asNum)] = purchase;
          }

          this.StockMap[pidStr] = net;
        });
        // Debug logging to help investigate mismatched stock counts
        try {
          // removed verbose debug logs
        } catch (e) {
          // ignore
        }
        this.applyStockToProducts();
      })
      .catch(() => this.applyStockToProducts());
  }

  refreshStock() {
    this.buildStockFromSql();
  }




  // Returns true when a transporter/vehicle has been selected in the form
  hasSelectedTransport(): boolean {
    try {
      const t1 = this.saleDetail && this.saleDetail.TransporterID;
      const t2 = this.booking && (this.booking.VehicleNo || this.booking.CofNo || this.booking.BuiltyNo);
      return !!(t1 || t2);
    } catch (e) {
      return false;
    }
  }

  ngOnInit() {
    this.Cancel();
    Promise.all([
      this.http.getData('products?orderby=ProductName'),
    ]).then(([products]: any[]) => {
      this.AllProducts = (products || []).filter((p: any) => p && (p.ProductName || p.ProductID));
      // Load real stock from DB, then update products
      this.buildStockFromSql().then(() => {
        this.applyStockToProducts();
      });
      // Also attempt to fetch posted stock from API as a fallback
     }).catch(() => {
      this.http.getData('products?orderby=ProductName').then((products: unknown) => {
        const prodArr = (products as any[]) || [];
        this.AllProducts = prodArr.filter((p: any) => p && (p.ProductName || p.ProductID));
        this.Products = this.AllProducts.map((p: any) => ({ ...p, Stock: 0, DisplayName: p.ProductName }));
      });
    });
    this.cachedData.Accounts$.subscribe((accounts: any[]) => {
      this.Customers = accounts.filter(
        (c) => c.AcctType.toUpperCase() === 'CUSTOMERS'
      );
    });
    // Subscribe to shared stock observable so PostedStockMap is kept in sync
    this.cachedData.Stock$.subscribe((rows: any[]) => {
        try {
          if (!rows || !rows.length) {
          // fallback to direct API if cached rows are empty
          return;
        }
        this.PostedStockMap = {};
        (rows || []).forEach((r: any) => {
          const pid = r.ProductID == null || r.ProductID === undefined ? '' : String(r.ProductID);
          const stockVal = Number(r.Stock) || 0;
          this.PostedStockMap[pid] = stockVal;
          const trimmed = pid.trim ? pid.trim() : pid;
          if (trimmed !== pid) this.PostedStockMap[trimmed] = stockVal;
          const asNum = Number(trimmed);
          if (!Number.isNaN(asNum)) this.PostedStockMap[String(asNum)] = stockVal;
        });

        // DEBUG: log sample of PostedStockMap keys for tracing
        try {
          console.debug('CachedData.Stock$ - PostedStockMap sample:', Object.keys(this.PostedStockMap).slice(0,20).reduce((o: any, k: any) => { o[k]=this.PostedStockMap[k]; return o; }, {}));
        } catch (e) { /* ignore */ }
        // debug sample of PostedStockMap keys
        try {
          /* sample keys logging removed */
        } catch (e) { /* ignore */ }
      } catch (e) {
        console.error('Error mapping CachedData.Stock$ rows to PostedStockMap', e);
      }
      this.applyStockToProducts();
    });
    this.cachedData.updateSuppliers();
    this.cachedData.Suppliers$.subscribe((suppliers: any[]) => {
      this.Suppliers = suppliers || [];
    });
    // Try to build Transporters list from recent bookings (fallback when no dedicated endpoint)
    try {
      // Request only VehicleNo first (safer). If server rejects requested fields,
      // retry without `flds`. This prevents 500 errors when some DB views lack fields.
      this.http.getData('qrybooking', { flds: 'VehicleNo', orderby: 'Date desc' })
        .then((rows: any) => {
          try {
            const seen = new Set<string>();
            const items: any[] = [];
            (rows || []).forEach((r: any) => {
              const candidates = [r.VehicleNo, r.Transport, r.TruckNo];
              for (const c of candidates) {
                if (c && String(c).trim() !== '' && !seen.has(String(c).trim())) {
                  const v = String(c).trim();
                  seen.add(v);
                  items.push({ TransporterID: v, TransporterName: v });
                }
              }
            });
            this.Transporters = items;
          } catch (e) {
            this.Transporters = [];
          }
        })
        .catch(() => {
          // Retry without flds if server rejected requested fields
          this.http.getData('qrybooking', { orderby: 'Date desc' })
            .then((rows: any) => {
              try {
                const seen = new Set<string>();
                const items: any[] = [];
                (rows || []).forEach((r: any) => {
                  const candidates = [r.VehicleNo, r.Transport, r.TruckNo];
                  for (const c of candidates) {
                    if (c && String(c).trim() !== '' && !seen.has(String(c).trim())) {
                      const v = String(c).trim();
                      seen.add(v);
                      items.push({ TransporterID: v, TransporterName: v });
                    }
                  }
                });
                this.Transporters = items;
              } catch (e) {
                this.Transporters = [];
              }
            })
            .catch(() => { this.Transporters = []; });
        });
    } catch (e) { this.Transporters = []; }
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
      TransporterID: undefined,
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
    this.TransportProductQty = {};
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
              // console.log removed

            this.myToaster.Sucess('Booking saved successfully.', 'Success');
            this.saleData = [];
            this.bookData = [];
            this.TransportProductQty = {};
            this.calcBooking();
            this.calcSaleData();
            this.Cancel();
            this.EditID = '';

            // Auto-post the booking so stock is updated immediately.
            // Booking POST returns { id: <BookingID> }


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


  onBookingProductChange(event: any) {
    if (this.requireTransportFirst && !this.hasSelectedTransport()) {
      this.myToaster.Error('Please select transport number first.', 'Validation Error');
      return;
    }
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
    // update selected product stock display
    try { this.SelectedProductStock = this.getStock(this.saleDetail.ProductID); } catch (e) { this.SelectedProductStock = 0; }
  }

  // Handler for product selection in sale form (ng-select ngModelChange)
  onSaleProductChange(val: any) {
    if (this.requireTransportFirst && !this.hasSelectedTransport()) {
      this.myToaster.Error('Please select transport number first.', 'Validation Error');
      return;
    }
    try {
      // Support both id (string/number) and product object coming from different ng-select configurations
      let pid: string = '';
      let prod: any = null;

      if (val && typeof val === 'object') {
        // common object shapes: { ItemID } or { ProductID }
        pid = (val.ItemID || val.ProductID || val.id || '') + '';
        if (!pid && (val.ItemName || val.ProductName)) {
          // fallback: try to find product by name
          const name = (val.ItemName || val.ProductName || '').toString().toLowerCase();
          prod = (this.Products || []).find((p: any) => (p.ProductName || p.ItemName || '').toString().toLowerCase() === name)
            || (this.AllProducts || []).find((p: any) => (p.ProductName || p.ItemName || '').toString().toLowerCase() === name);
          if (prod) pid = String(prod.ProductID || prod.ItemID || '');
        }
      } else {
        pid = val === null || val === undefined ? '' : String(val);
      }

      if (!prod && pid) {
        prod = (this.Products || []).find((p: any) => String(p.ProductID) === pid) || (this.AllProducts || []).find((p: any) => String(p.ProductID) === pid);
      }

      if (prod) {
        this.saleDetail.ProductName = prod.ProductName || this.saleDetail.ProductName;
      }

      // Compute selected stock: prefer transport-specific if transporter selected
      this.SelectedProductStock = this.hasSelectedTransport() ? this.getTransportBagsForSelected() : this.getStock(pid || (prod && (prod.ProductID || prod.ItemID) || ''));
      this.NetStocks = this.SelectedProductStock || 0;
    } catch (e) {
      this.SelectedProductStock = 0;
    }
  }

  getTransportBagsForSelected(): number {
    try {
      const pid = this.saleDetail && (this.saleDetail.ProductID || '') || this.bookingDetail && (this.bookingDetail.ProductID || '') || '';
      const key = pid === null || pid === undefined ? '' : String(pid);
      const transportBags = Number(this.TransportProductQty[key] || 0);
      // Add any new in-memory purchase bags for this product and subtract in-memory sales
      const inMemoryPurchase = this.getInMemoryPurchaseBags(key);
      const alreadySold = this.getInMemorySaleBags(key);
      return Math.max(0, transportBags + inMemoryPurchase - alreadySold);
    } catch (e) {
      return 0;
    }
  }

  onTransporterChange(val: any) {
    const v = val ? String(val).trim() : '';
    if (!v) {
      this.applyStockToProducts();
      return;
    }
    // Sync the transport/vehicle no into booking.VehicleNo so saved sales are linked correctly
    if (this.booking) {
      this.booking.VehicleNo = v;
    }

    // Direct SQL: join booking_details + booking filtered by VehicleNo to get per-product bag counts
    const sql = `SELECT bd.ProductID, p.ProductName,
      SUM(CASE WHEN bd.Type=1 THEN bd.Qty * IFNULL(bd.Packing,20) ELSE 0 END) AS PurchaseBags,
      SUM(CASE WHEN bd.Type=2 THEN bd.Qty ELSE 0 END) AS SaleBags
      FROM booking_details bd
      JOIN booking b ON b.BookingID = bd.BookingID
      JOIN products p ON p.ProductID = bd.ProductID
      WHERE b.VehicleNo = '${v.replace(/'/g, "''")}'
      GROUP BY bd.ProductID, p.ProductName`;

    this.http.getData('MQRY?qrysql=' + encodeURIComponent(sql))
      .then((rows: any) => {
        const idSet = new Set<string>();
        const pidNameMap: { [pid: string]: string } = {};
        const transportBagsMap: { [pid: string]: number } = {};

        (rows || []).forEach((r: any) => {
          const pidStr = r.ProductID !== null && r.ProductID !== undefined ? String(r.ProductID) : '';
          if (!pidStr) return;
          const purchaseBags = Number(r.PurchaseBags) || 0;
          const saleBags = Number(r.SaleBags) || 0;
          const netBags = Math.max(0, purchaseBags - saleBags);
          idSet.add(pidStr);
          pidNameMap[pidStr] = r.ProductName || '';
          transportBagsMap[pidStr] = netBags;
          const pidNum = String(Number(pidStr.trim()));
          if (pidNum !== pidStr) {
            transportBagsMap[pidNum] = netBags;
            idSet.add(pidNum);
          }
        });

        const applyFilter = (allProds: any[]) => {
          const matched = idSet.size
            ? (allProds || []).filter((p: any) => {
                const k = p && p.ProductID !== undefined && p.ProductID !== null ? String(p.ProductID) : '';
                return idSet.has(k);
              })
            : [];

          let final = matched.map((p: any) => {
            const k = p && p.ProductID !== undefined && p.ProductID !== null ? String(p.ProductID) : '';
            const tBags = transportBagsMap[k] ?? transportBagsMap[String(Number(k))] ?? 0;
            return {
              ...p,
              Stock: this.getStock(k),
              TransportBags: tBags,
              disabled: false,
              DisplayName: p.ProductName || '',
            };
          });

          if (final.length === 0 && idSet.size) {
            final = Array.from(idSet)
              .filter(pid => transportBagsMap[pid] !== undefined)
              .map(pid => ({
                ProductID: pid,
                ProductName: pidNameMap[pid] || ('Product ' + pid),
                Stock: this.getStock(pid),
                TransportBags: transportBagsMap[pid] ?? 0,
                disabled: false,
                DisplayName: pidNameMap[pid] || ('Product ' + pid),
              }));
          }

          this.Products = final;
          this.TransportProductQty = {};
          (final || []).forEach((fp: any) => {
            const k = fp && fp.ProductID !== undefined && fp.ProductID !== null ? String(fp.ProductID) : '';
            this.TransportProductQty[k] = Number(fp.TransportBags ?? 0);
          });

          // DEBUG: log final TransportProductQty
          try {
            console.debug('onTransporterChange - TransportProductQty:', this.TransportProductQty);
          } catch (e) { /* ignore */ }

          try {
            const pid = this.saleDetail && this.saleDetail.ProductID ? String(this.saleDetail.ProductID) : null;
            if (pid) {
              const found = (final || []).find((p: any) => String(p.ProductID) === pid);
              this.SelectedProductStock = found ? Number(found.TransportBags ?? found.Stock ?? 0) : 0;
              this.NetStocks = this.SelectedProductStock;
            } else {
              this.SelectedProductStock = 0;
              this.NetStocks = 0;
            }
          } catch (e) {
            this.SelectedProductStock = 0;
            this.NetStocks = 0;
          }
        };

        if (this.AllProducts && this.AllProducts.length) {
          applyFilter(this.AllProducts);
        } else {
          this.http.getData('products?orderby=ProductName')
            .then((prods: any) => {
              this.AllProducts = prods || [];
              applyFilter(this.AllProducts);
            })
            .catch(() => {
              this.Products = [];
              this.SelectedProductStock = 0;
              this.NetStocks = 0;
            });
        }
      })
      .catch((err: any) => {
        console.error('onTransporterChange - SQL query failed', err);
        this.Products = [];
        this.SelectedProductStock = 0;
        this.NetStocks = 0;
      });
  }

  onVehicleNoChange(val: any) {
    const v = val ? String(val).trim() : '';
    if (!v) {
      // Clear transporter selection and restore default product list
      try {
        if (!this.saleDetail) this.saleDetail = {} as SaleDetail;
        this.saleDetail.TransporterID = undefined;
      } catch (e) {}
      this.applyStockToProducts();
      return;
    }

    // Mirror vehicle no into saleDetail.TransporterID and trigger same filtering
    try {
      if (!this.saleDetail) this.saleDetail = {} as SaleDetail;
      this.saleDetail.TransporterID = v;
    } catch (e) {}
    this.onTransporterChange(v);
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
      (acc, item) => acc + item.Qty * (item.Packing ? item.Packing : 20),
      0
    );
    // Refresh products stock display so new in-memory purchases are applied immediately
    try {
      this.applyStockToProducts();
      const pid = this.saleDetail && this.saleDetail.ProductID ? this.saleDetail.ProductID : (this.bookingDetail && this.bookingDetail.ProductID ? this.bookingDetail.ProductID : null);
      if (pid) {
        this.SelectedProductStock = this.hasSelectedTransport() ? this.getTransportBagsForSelected() : this.getStock(pid);
        this.NetStocks = this.SelectedProductStock || 0;
      }
    } catch (e) {
      // ignore
    }
  }
  addSaleItem() {
    if (this.requireTransportFirst && !this.hasSelectedTransport()) {
      this.myToaster.Error('Please select transport number first before adding products.', 'Validation Error');
      return;
    }
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

    // Stock validation: use transport-specific bags if a transport is selected, else global stock
    const hasTransportData = this.TransportProductQty && Object.keys(this.TransportProductQty).length > 0;
    const availableStock = hasTransportData
      ? this.getTransportBagsForSelected()
      : this.getStock(this.saleDetail.ProductID);
    // getTransportBagsForSelected() already subtracts in-session sales, so only compare requested qty
    const alreadyAdded = hasTransportData ? 0 : this.saleData
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
    // Update selected product stock after adding sale item
    try {
      const pid = saleItem.ProductID;
      this.SelectedProductStock = this.getStock(pid);
      this.NetStocks = this.SelectedProductStock || 0;
    } catch (e) { /* ignore */ }
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
    // Update selected product stock after removing sale item
    try {
      const pid = this.saleDetail && this.saleDetail.ProductID ? this.saleDetail.ProductID : undefined;
      if (pid !== undefined && pid !== null) {
        this.SelectedProductStock = this.getStock(pid);
        this.NetStocks = this.SelectedProductStock || 0;
      }
    } catch (e) { /* ignore */ }
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
