import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import swal from 'sweetalert';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-stock-accts',
  templateUrl: './stock-accts.component.html',
  styleUrls: ['./stock-accts.component.scss'],
})
export class StockAcctsComponent implements OnInit {
  @ViewChild('cmbProduct') cmbProduct: any;
  @ViewChild('cmbAccount') cmbAccount: any;
  public data: object[] = [];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '',
    CustomerID: '',
    ItemID: '',
    What: '2',
  };


  colProducts = [
    { label: 'Date', fldName: 'Date' },
    { label: 'Invoice No', fldName: 'RefID' },
    { label: 'Customer Name', fldName: 'CustomerName' },
    { label: 'Stock In', fldName: 'QtyIn' },
    { label: 'Stock Out', fldName: 'QtyOut' },
    { label: 'Balance', fldName: 'Balance' },
  ];
  colUnits = [
    { label: 'Date', fldName: 'Date' },
    { label: 'Customer Name', fldName: 'CustomerName' },
    { label: 'Stock In', fldName: 'QtyIn' },
    { label: 'Stock Out', fldName: 'QtyOut' },
  ];
  setting: any = {
    Columns: [],
    Actions: [],
    Data: [],
  };
  lstDataRource: any = [];
  lstSelectable: any[] = [];
  PostedStockMap: any = {};
  lstAccounts: any = [];
  lstSuppliers: any = [];
  stores$: Observable<any[]>;
  accounts$: Observable<any[]>;

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router,
    private myToaster: MyToastService
  ) {
    this.stores$ = this.cachedData.Stores$;
    this.accounts$ = this.cachedData.Accounts$;
  }

  // Build lstSelectable and lstDataRource with NET bags = purchased bags − sold bags.
  // Uses booking_details directly (raw table): Type=1 purchase (Qty tons × Packing=20),
  // Type=2 sale (Qty already in bags, Packing not stored for sales).
  loadProductsAndStock() {
    const netSql = `SELECT bd.ProductID,
      SUM(CASE WHEN bd.Type=1 THEN bd.Qty * IFNULL(bd.Packing,20) ELSE 0 END) AS PurchaseBags,
      SUM(CASE WHEN bd.Type=2 THEN bd.Qty ELSE 0 END) AS SaleBags,
      p.ProductName
      FROM booking_details bd
      LEFT JOIN products p ON bd.ProductID = p.ProductID
      GROUP BY bd.ProductID, p.ProductName`;

    Promise.all([
      this.http.getData('qryproducts?flds=ProductID as ItemID, ProductName as ItemName&orderby=ProductName'),
      this.http.getData('MQRY?qrysql=' + encodeURIComponent(netSql)),
    ]).then(([products, stockRows]: any[]) => {
      const bagMap: any = {};
      const nameMap: any = {};
      (stockRows || []).forEach((r: any) => {
        const pid = String(r.ProductID);
        const net = Math.max(0, (Number(r.PurchaseBags) || 0) - (Number(r.SaleBags) || 0));
        bagMap[pid] = net;
        if (!nameMap[pid]) nameMap[pid] = r.ProductName || '';
      });

      this.lstSelectable = Object.keys(bagMap)
        .filter((pid) => bagMap[pid] > 0)
        .map((pid) => ({
          ItemID: pid,
          ItemName: nameMap[pid],
          Stock: bagMap[pid],
          PostedStock: bagMap[pid],
        }));

      this.lstDataRource = (products || []).map((p: any) => ({
        ...p,
        Stock: bagMap[String(p.ItemID)] || 0,
        PostedStock: bagMap[String(p.ItemID)] || 0,
      }));
    }).catch(() => {
      this.http.getData('qryproducts?flds=ProductID as ItemID, ProductName as ItemName&orderby=ProductName')
        .then((r: any) => { this.lstDataRource = r; this.lstSelectable = r; });
    });
  }

  ngOnInit() {
    this.Filter.FromDate.day = 1;
    this.loadProductsAndStock();

    // Suppliers: filter accounts where AcctType = 'SUPPLIERS' (same approach as booking-invoice)
    this.cachedData.updateAccounts();
    this.cachedData.Accounts$.subscribe((accounts: any[]) => {
      if (accounts && accounts.length) {
        this.lstSuppliers = accounts.filter(
          (c: any) => c.AcctType && c.AcctType.toUpperCase() === 'SUPPLIERS'
        );
        this.lstCustomers = accounts.filter(
          (c: any) => c.AcctType && c.AcctType.toUpperCase() === 'CUSTOMERS'
        );
        this.lstAccounts = accounts;
      }
    });
    this.FilterData();
    this.LoadSavedBookings();
    this.LoadSavedSales();
  }

  FilterData() {
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";
    if (this.Filter.StoreID !== '' && this.Filter.StoreID !== null) {
      filter += ' and StoreID = ' + this.Filter.StoreID;
    }
    if (!(this.Filter.ItemID === '' || this.Filter.ItemID === null)) {
      if (this.Filter.What === '1') {
        this.LoadProductsData(filter);
      } else {
        this.LoadUnitsData(filter);
      }
    }
    this.LoadSavedBookings();
    this.LoadSavedSales();
    this.loadProductsAndStock();
  }

  LoadUnitsData(filter: string) {
    filter += " and UnitName = '" + this.Filter.ItemID + "'";
    this.http
      .getData(
        'qrystockaccts?flds=Date,RefID,CustomerName, QtyIn, QtyOut' +
          ' &filter=' + filter + '&orderby=AcctID'
      )
      .then((r: any) => {
        this.setting.Columns = this.colUnits;
        this.data = r;
      });
  }

  LoadProductsData(filter: string) {
    filter += ' and ProductID = ' + this.Filter.ItemID;
    this.http
      .getData(
        'qrystockaccts?flds=Date, RefID, CustomerName, QtyIn, QtyOut, Balance' +
          ' &filter=' + filter + '&orderby=AcctID'
      )
      .then((r: any) => {
        this.setting.Columns = this.colProducts;
        this.data = r;
      });
  }

  Clicked(e: any): void {}

  // Saved bookings list
  savedBookings: any[] = [];

  LoadSavedBookings() {
    const filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "' and DtCr='Dr'";
    this.http
      .getData('qrybooking?filter=' + filter + '&orderby=Date desc')
      .then((r: any) => {
        const bookings = (r || []);
        if (!bookings.length) {
          this.savedBookings = [];
          return;
        }
        // Build a map of booking header info keyed by BookingID
        const bookingMap: { [id: string]: any } = {};
        bookings.forEach((b: any) => {
          bookingMap[b.BookingID] = {
            Date: b.Date ? b.Date.substring(0, 10) : b.Date,
            CustomerName: b.CustomerName,
            IsPosted: b.IsPosted,
            Status: b.IsPosted == 1 ? 'Posted' : 'Un-Posted',
          };
        });
        const ids = bookings.map((b: any) => b.BookingID).join(',');
        this.http
          .getData('qrybookingpurchase?filter=BookingID IN (' + ids + ')')
          .then((details: any) => {
            this.savedBookings = (details || []).map((d: any) => {
              const header = bookingMap[d.BookingID] || {};
              const qty = Number(d.Qty) || 0;
              const packing = Number(d.Packing) || 20;
              return {
                BookingID: d.BookingID,
                Date: header.Date || '',
                CustomerName: header.CustomerName || '',
                  ProductID: d.ProductID || d.ItemID || null,
                  ProductName: d.ProductName || d.ItemName || '',
                Qty: qty,
                Bags: qty * packing,
                IsPosted: header.IsPosted,
                Status: header.Status || '',
              };
            });
          })
          .catch(() => {
            this.savedBookings = [];
          });
      });
  }

  get savedBookingsTotalAmount(): number {
    return this.savedBookings.reduce((s, b) => s + (Number(b.Amount) || 0), 0);
  }
  get savedBookingsTotalCarriage(): number {
    return this.savedBookings.reduce((s, b) => s + (Number(b.Carriage) || 0), 0);
  }
  get savedBookingsTotalNet(): number {
    return this.savedBookings.reduce((s, b) => s + (Number(b.NetAmount) || 0), 0);
  }
  get savedBookingsTotalBags(): number {
    return this.savedBookings.reduce((s, b) => s + (Number(b.Bags) || 0), 0);
  }
  get savedBookingsTotalQty(): number {
    return this.savedBookings.reduce((s, b) => s + (Number(b.Qty) || 0), 0);
  }

  // Booking UI logic
  BookingDate: any = GetDateJSON();
  Booking = {
    SupplierID: '',
    SupplierName: '',
    ProductID: '',
    ProductName: '',
    Qty: 0,
    Bags: 0,
    Price: 0,
    Carriage: 0,
    Amount: 0,
  };
  BookingItems: any[] = [];
  BookingTotals = {
    TotalAmount: 0,
    Carriage: 0,
    NetAmount: 0,
  };

  // Sale UI logic
  lstCustomers: any[] = [];
  SaleDate: any = GetDateJSON();
  Sale = {
    CustomerID: '',
    CustomerName: '',
    ProductID: '',
    ProductName: '',
    Bags: 0,
    Price: 0,
    Amount: 0,
  };
  SaleItems: any[] = [];
  SaleTotals = {
    TotalBags: 0,
    TotalAmount: 0,
  };

  computeSaleAmount() {
    const bags = Number(this.Sale.Bags) || 0;
    const price = Number(this.Sale.Price) || 0;
    this.Sale.Amount = bags * price;
  }

  onSaleProductChange(e: any) {
    if (e) {
      this.Sale.ProductID = e.ItemID || '';
      this.Sale.ProductName = e.ItemName || '';
    }
  }

  onSaleCustomerChange(e: any) {
    if (e) {
      this.Sale.CustomerID = e.CustomerID || '';
      this.Sale.CustomerName = e.CustomerName || '';
    }
  }

  addSaleItem() {
    if (!this.Sale.CustomerID || !this.Sale.ProductID) {
      this.myToaster.Error('Please select a customer and product.', 'Validation Error');
      return;
    }
    if (!this.Sale.Bags || this.Sale.Bags <= 0) {
      this.myToaster.Error('Please enter a valid bag quantity.', 'Validation Error');
      return;
    }
    const prod = this.lstSelectable.find((p: any) => String(p.ItemID) === String(this.Sale.ProductID));
    const availableBags = prod ? (Number(prod.Stock) || 0) : 0;
    if (Number(this.Sale.Bags) > availableBags) {
      this.myToaster.Error(`Only ${availableBags} bags available in stock.`, 'Insufficient Stock');
      return;
    }
    this.SaleItems.push({
      CustomerID: this.Sale.CustomerID,
      CustomerName: this.Sale.CustomerName,
      ProductID: this.Sale.ProductID,
      ProductName: this.Sale.ProductName,
      Bags: Number(this.Sale.Bags),
      Price: Number(this.Sale.Price),
      Amount: Number(this.Sale.Amount),
    });
    this.computeSaleTotals();
    this.Sale.Bags = 0;
    this.Sale.Price = 0;
    this.Sale.Amount = 0;
  }

  removeSaleItem(idx: number) {
    if (idx < 0 || idx >= this.SaleItems.length) return;
    this.SaleItems.splice(idx, 1);
    this.computeSaleTotals();
  }

  computeSaleTotals() {
    this.SaleTotals.TotalBags = this.SaleItems.reduce((s, it) => s + (Number(it.Bags) || 0), 0);
    this.SaleTotals.TotalAmount = this.SaleItems.reduce((s, it) => s + (Number(it.Amount) || 0), 0);
  }

  // Saved sales list
  savedSales: any[] = [];

  LoadSavedSales() {
    const filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "' and DtCr='CR'";
    this.http
      .getData('qrybooking?filter=' + filter + '&orderby=Date desc')
      .then((r: any) => {
        const bookings = (r || []);
        if (!bookings.length) {
          this.savedSales = [];
          return;
        }
        const bookingMap: { [id: string]: any } = {};
        bookings.forEach((b: any) => {
          bookingMap[b.BookingID] = {
            Date: b.Date ? b.Date.substring(0, 10) : b.Date,
            IsPosted: b.IsPosted,
            Status: b.IsPosted == 1 ? 'Posted' : 'Un-Posted',
          };
        });
        const ids = bookings.map((b: any) => b.BookingID).join(',');
        this.http
          .getData('qrybookingsale?filter=BookingID IN (' + ids + ')')
          .then((details: any) => {
            this.savedSales = (details || []).map((d: any) => {
              const header = bookingMap[d.BookingID] || {};
              return {
                BookingID: d.BookingID,
                Date: header.Date || '',
                CustomerName: d.CustomerName || '',
                ProductName: d.ProductName || d.ItemName || '',
                Bags: Number(d.Qty) || 0,
                Price: Number(d.SPrice) || Number(d.PPrice) || 0,
                Amount: Number(d.Amount) || 0,
                IsPosted: header.IsPosted,
                Status: header.Status || '',
              };
            });
          })
          .catch(() => { this.savedSales = []; });
      });
  }

  postSale(bookingID: any) {
    this.http.postTask('postbooking/' + bookingID, {})
      .then(() => {
        this.myToaster.Sucess('Sale posted successfully.', 'Success');
        this.LoadSavedSales();
        this.loadProductsAndStock();
        try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
      })
      .catch(() => {
        this.myToaster.Error('Failed to post sale.', 'Error');
      });
  }

  get savedSalesTotalBags(): number {
    const seen = new Set<any>();
    return this.savedSales.reduce((s, b) => {
      if (!seen.has(b.BookingID + '_' + b.ProductName)) {
        seen.add(b.BookingID + '_' + b.ProductName);
        return s + (Number(b.Bags) || 0);
      }
      return s;
    }, 0);
  }

  SaveSale() {
    if (!this.SaleItems.length) {
      this.myToaster.Error('Please add at least one item before saving.', 'Validation Error');
      return;
    }
    const totalBags = this.SaleItems.reduce((s, it) => s + (Number(it.Bags) || 0), 0);
    const payload = {
      Date: JSON2Date(this.SaleDate),
      // SupplierID is required by the PHP booking_post — use empty string to avoid undefined errors
      SupplierID: '',
      DtCr: 'CR',
      BagsPurchase: 0,
      BagsSold: totalBags,
      Amount: this.SaleTotals.TotalAmount,
      Carriage: 0,
      NetAmount: this.SaleTotals.TotalAmount,
      // PHP booking_post does foreach($details) — must be an empty array, not missing
      details: [],
      sales: this.SaleItems.map(it => ({
        ProductID: it.ProductID,
        ProductName: it.ProductName,
        Qty: it.Bags,
        Price: it.Price,
        Amount: it.Amount,
        Packing: 1,
        CustomerID: it.CustomerID,
        CustomerName: it.CustomerName,
        Discount: 0,
        Received: 0,
      })),
    };
    this.http.postTask('booking', payload)
      .then((r: any) => {
        this.myToaster.Sucess('Sale saved successfully.', 'Success');
        this.SaleItems = [];
        this.SaleTotals = { TotalBags: 0, TotalAmount: 0 };
        this.SaleDate = GetDateJSON();
        const bookingId = r && (r.id || r.bookingID || r.BookingID);
        if (bookingId) {
          this.http.postTask('postbooking/' + bookingId, {})
            .then(() => {
              this.LoadSavedSales();
              setTimeout(() => this.loadProductsAndStock(), 400);
              try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
            })
            .catch(() => {
              // auto-post failed — reload sales list so the user can see & manually post
              this.LoadSavedSales();
              this.loadProductsAndStock();
              try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
            });
        } else {
          this.LoadSavedSales();
          this.loadProductsAndStock();
          try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
        }
      })
      .catch((_err) => {
        this.myToaster.Error('Failed to save sale.', 'Error');
      });
  }

  computeBookingAmount() {
    const q = Number(this.Booking.Qty) || 0;
    const p = Number(this.Booking.Price) || 0;
    this.Booking.Bags = q * 20;   // 1 ton = 20 bags
    this.Booking.Amount = q * p;
  }

  // Helper: return product object by id
  getProductById(id: any) {
    if (!id || !this.lstDataRource) return null;
    return this.lstDataRource.find((p: any) => String(p.ItemID) === String(id)) || null;
  }

  // Helper: whether currently selected product is out of stock
  isSelectedProductOutOfStock(): boolean {
    return false;
  }

  addBookingItem(force: boolean = false) {
    if (!this.Booking.SupplierID || !this.Booking.ProductID) {
      this.myToaster.Error('Please select a supplier and product.', 'Validation Error');
      return;
    }
    if (!this.Booking.Qty || this.Booking.Qty <= 0) {
      this.myToaster.Error('Please enter a valid quantity.', 'Validation Error');
      return;
    }
    // Prevent adding when selected product is out of stock unless forced
    const prod = this.lstDataRource && this.lstDataRource.find((p: any) => String(p.ItemID) === String(this.Booking.ProductID));
    if (prod && prod.disabled && !force) {
      this.myToaster.Error('Selected product is out of stock. Use "Add Anyway" to override.', 'Out of Stock');
      return;
    }
    const item = {
      SupplierID: this.Booking.SupplierID,
      Supplier: this.Booking.SupplierName || this.getSupplierName(this.Booking.SupplierID) || '',
      ProductID: this.Booking.ProductID,
      ProductName: this.Booking.ProductName || this.getProductName(this.Booking.ProductID),
      Qty: Number(this.Booking.Qty) || 0,
      Bags: Number(this.Booking.Bags) || 0,
      Rate: Number(this.Booking.Price) || 0,
      Carriage: Number(this.Booking.Carriage) || 0,
      Amount: Number(this.Booking.Amount) || 0,
    };
    this.BookingItems.push(item);
    this.computeBookingTotals();
    // reset qty/price/amount for next entry
    this.Booking.Qty = 0;
    this.Booking.Bags = 0;
    this.Booking.Price = 0;
    this.Booking.Carriage = 0;
    this.Booking.Amount = 0;
  }

  // Delete a booking by ID with confirmation. Respects posted status.
  deleteBooking(bookingID: any, isPosted: any) {
    if (!bookingID) {
      this.myToaster.Error('Invalid booking ID', 'Error');
      return;
    }

    const doDelete = () => {
      const table = { ID: bookingID, Table: 'B' };
      this.http.postTask('delete', table).then(() => {
        this.myToaster.Sucess('Booking deleted', 'Deleted');
        this.LoadSavedBookings();
        this.loadProductsAndStock();
      }).catch((er) => {
        const msg = (er && er.error && er.error.message) || (er && er.message) || 'Error while deleting booking';
        swal('Oops!', msg, 'error');
      });
    };

    if (Number(isPosted) === 1) {
      swal({ title: 'Delete Posted Booking', text: 'This booking is posted. Deleting it is permanent and will NOT reverse accounting entries. Are you sure?', icon: 'warning', dangerMode: true, buttons: { cancel: { text: 'Cancel', value: false, visible: true }, confirm: { text: 'Delete Permanently', value: true } } }).then((force) => {
        if (force) doDelete();
      });
    } else {
      swal({ title: 'Delete Booking', text: 'This will permanently delete the booking. Continue?', icon: 'warning', dangerMode: true, buttons: { cancel: { text: 'Cancel', value: false, visible: true }, confirm: { text: 'Delete', value: true } } }).then((willDelete) => {
        if (willDelete) doDelete();
      });
    }
  }

  SaveBooking() {
    if (!this.BookingItems.length) {
      this.myToaster.Error('Please add at least one item before saving.', 'Validation Error');
      return;
    }
    const firstItem = this.BookingItems[0];
    const totalBags = this.BookingItems.reduce((s, it) => s + (Number(it.Bags) || 0), 0);
    const totalQty = this.BookingItems.reduce((s, it) => s + (Number(it.Qty) || 0), 0);
    const payload = {
      Date: JSON2Date(this.BookingDate),
      SupplierID: firstItem.SupplierID,
      Amount: this.BookingTotals.TotalAmount,
      Carriage: this.BookingTotals.Carriage,
      NetAmount: this.BookingTotals.NetAmount,
      BagsPurchase: totalBags,
      DtCr: 'Dr',
      details: this.BookingItems.map(it => ({
        ProductID: it.ProductID,
        ProductName: it.ProductName,
        Qty: it.Qty,
        Bags: it.Bags,
        Price: it.Rate,
        Carriage: it.Carriage,
        Amount: it.Amount,
        Packing: 20,
      })),
    };
    this.http.postTask('booking', payload)
      .then((r: any) => {
        this.myToaster.Sucess('Booking saved successfully.', 'Success');
        this.BookingItems = [];
        this.BookingTotals = { TotalAmount: 0, Carriage: 0, NetAmount: 0 };
        this.BookingDate = GetDateJSON();
        this.LoadSavedBookings();
        // Auto-post saved booking so posted-stock (bags) updates immediately
        const bookingId = r && (r.id || r.bookingID || r.BookingID);
        if (bookingId) {
          this.http.postTask('postbooking/' + bookingId, {})
            .then(() => {
              // Reload products and stock so lstSelectable and lstDataRource reflect new booking
              setTimeout(() => this.loadProductsAndStock(), 400);
              try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
            })
            .catch(() => {
              // fallback: still reload products
              this.loadProductsAndStock();
              try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
            });
        } else {
          this.loadProductsAndStock();
          try { this.cachedData.updateStock(); } catch (e) { /* ignore */ }
        }
      })
      .catch((_err) => {
        this.myToaster.Error('Failed to save booking.', 'Error');
      });
  }

  // Refresh posted stock values from server and update lstDataRource stocks
  refreshPostedStock() {
    this.http.getStock()
      .then((postedStock: any[]) => {
        const stockMap: any = {};
        (postedStock || []).forEach((s: any) => {
          stockMap[s.ProductID] = Number(s.Stock) || 0;
        });
        this.lstDataRource = (this.lstDataRource || []).map((p: any) => ({
          ...p,
          Stock: stockMap[p.ItemID] || 0,
        }));
      })
      .catch(() => {
        // ignore failures - keep existing stock values
      });
  }

  removeBookingItem(idx: number) {
    if (idx < 0 || idx >= this.BookingItems.length) return;
    this.BookingItems.splice(idx, 1);
    this.computeBookingTotals();
  }

  // Load a saved booking row into SaleItems so user can create a sale from it
  loadBookingToSale(bk: any) {
    if (!bk || !bk.ProductID) {
      this.myToaster.Error('Selected booking does not contain a valid product ID', 'Error');
      return;
    }
    // set sale date to booking date so SaveSale uses correct date
    if (bk.Date) this.SaleDate = bk.Date;
    const item: any = {
      ProductID: bk.ProductID,
      ProductName: bk.ProductName || '',
      Qty: Number(bk.Qty) || 0,
      Packing: 1,
      Bags: Number(bk.Bags) || 0,
      Price: 0,
      Amount: 0,
      CustomerID: bk.CustomerID || '',
      CustomerName: bk.CustomerName || '',
    };
    this.SaleItems.push(item);
    this.computeSaleTotals();
    this.myToaster.Sucess('Loaded booking item into sale details', 'Loaded');
  }

  computeBookingTotals() {
    const total = this.BookingItems.reduce((s, it) => s + (Number(it.Amount) || 0), 0);
    this.BookingTotals.TotalAmount = total;
    const c = Number(this.BookingTotals.Carriage) || 0;
    this.BookingTotals.NetAmount = total + c;
  }

  onProductChange(e: any) {
    if (e) {
      this.Booking.ProductID = e.ItemID || '';
      this.Booking.ProductName = e.ItemName || '';
    }
  }

  onSupplierChange(e: any) {
    if (e) {
      this.Booking.SupplierID = e.CustomerID || e.SupplierID || '';
      this.Booking.SupplierName = e.CustomerName || e.SupplierName || '';
    }
  }

  onBookingDateChange(d: any) {
    if (!d) return;
    this.BookingDate = d;
    // Also use booking date as the filter date for saved bookings
    this.Filter.FromDate = d;
    this.Filter.ToDate = d;
    this.FilterData();
  }

  getSupplierName(id: any) {
    const s = (this.lstSuppliers || []).find((x: any) => (x.CustomerID || x.SupplierID) == id);
    return s ? (s.CustomerName || s.SupplierName || '') : '';
  }

  getProductName(id: any) {
    const p = (this.lstDataRource || []).find((x: any) => x.ItemID == id);
    return p ? p.ItemName : '';
  }

  getProductStock(id: any): number {
    const p = (this.lstSelectable || []).find((x: any) => String(x.ItemID) === String(id));
    return p ? (Number(p.Stock) || 0) : 0;
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Product Accounts';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate) +
      ' Product: ' +
      this.cmbProduct.text +
      ' Account: ' +
      (this.cmbAccount ? this.cmbAccount.text : '');
    this.router.navigateByUrl('/print/print-html');
  }
  CustomerSelected(e: any): void {}
  formatDate(d: any): string {
    return JSON2Date(d);
  }
}
