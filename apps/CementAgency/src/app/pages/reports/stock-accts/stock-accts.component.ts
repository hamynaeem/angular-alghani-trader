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
  stockByProduct: { [pid: string]: number } = {};
  soldByProduct: { [pid: string]: number } = {};
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
  // Uses booking_details: Type=1 purchase (Qty tons × Packing), Type=2 sale (Qty in bags).
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
      const saleMap: any = {};
      const nameMap: any = {};
      (stockRows || []).forEach((r: any) => {
        const pid = String(r.ProductID);
        const purchase = Number(r.PurchaseBags) || 0;
        const sold = Number(r.SaleBags) || 0;
        const net = Math.max(0, purchase - sold);
        bagMap[pid] = net;
        saleMap[pid] = sold;
        if (!nameMap[pid]) nameMap[pid] = r.ProductName || '';
      });

      this.stockByProduct = bagMap;
      this.soldByProduct = saleMap;

      // DEBUG: log computed stock and sales maps to help trace NetStock issues
      try {
        console.debug('stockByProduct (sample):', Object.keys(bagMap).slice(0,20).reduce((o: any, k: any) => { o[k]=bagMap[k]; return o; }, {}));
        console.debug('soldByProduct (sample):', Object.keys(saleMap).slice(0,20).reduce((o: any, k: any) => { o[k]=saleMap[k]; return o; }, {}));
      } catch (e) { /* ignore logging errors */ }

      // Refresh SoldBags on already-loaded savedBookings rows but keep NetStock from LoadSavedBookings
      if (this.savedBookings.length) {
        this.savedBookings = this.savedBookings.map((bk: any) => ({
          ...bk,
          SoldBags: saleMap[String(bk.ProductID)] || 0,
        }));
      }

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
    // this.LoadSavedSales();
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
    // this.LoadSavedSales();
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
    const from = JSON2Date(this.Filter.FromDate);
    const to = JSON2Date(this.Filter.ToDate);

    // Group by VehicleNo + ProductID across ALL dates (not just filter range) so SaleBags reflects
    // all sales ever made against each transport. Date filter applies to purchase rows only.
    const sql = `SELECT b.VehicleNo,
      MAX(b.BookingID) AS BookingID,
      MAX(b.Date) AS Date,
      MAX(b.SupplierID) AS SupplierID,
      bd.ProductID,
      MAX(p.ProductName) AS ProductName,
      SUM(CASE WHEN bd.Type=1 AND b.Date BETWEEN '${from}' AND '${to}' THEN bd.Qty ELSE 0 END) AS QtyTons,
      SUM(CASE WHEN bd.Type=1 THEN bd.Qty * IFNULL(bd.Packing,20) ELSE 0 END) AS PurchaseBags,
      SUM(CASE WHEN bd.Type=2 THEN bd.Qty ELSE 0 END) AS SaleBags
      FROM booking b
      JOIN booking_details bd ON bd.BookingID = b.BookingID
      LEFT JOIN products p ON p.ProductID = bd.ProductID
      WHERE b.VehicleNo IS NOT NULL AND b.VehicleNo != ''
      GROUP BY b.VehicleNo, bd.ProductID
      HAVING PurchaseBags > 0
      ORDER BY Date DESC`;

    this.http.getData('MQRY?qrysql=' + encodeURIComponent(sql))
      .then((rows: any) => {
        this.savedBookings = (rows || []).map((r: any) => {
          const purchase = Number(r.PurchaseBags) || 0;
          const sold = Number(r.SaleBags) || 0;
          const net = Math.max(0, purchase - sold);
          const supplierName = (this.lstSuppliers.find((s: any) => String(s.CustomerID) === String(r.SupplierID))?.CustomerName) || '';
          return {
            BookingID: r.BookingID,
            Date: r.Date ? String(r.Date).substring(0, 10) : '',
            TransportNo: r.VehicleNo || '',
            SupplierID: r.SupplierID,
            CustomerName: supplierName,
            ProductID: r.ProductID,
            ProductName: r.ProductName || '',
            Qty: Number(r.QtyTons) || 0,
            Bags: purchase,
            NetStock: net,
            SoldBags: sold,
            IsPosted: 0,
            Status: '',
          };
        });
      })
      .catch(() => {
        this.savedBookings = [];
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

  // Backwards-compatible aliases used by template (some templates expect 'purchasedBookings')
  get purchasedBookings(): any[] {
    return this.savedBookings;
  }

  get purchasedBookingsTotalQty(): number {
    return this.savedBookingsTotalQty;
  }

  get purchasedBookingsTotalBags(): number {
    return this.savedBookingsTotalBags;
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
    TransportVehicleNo: '',
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

  // }

  computeBookingAmount() {
    const q = Number(this.Booking.Qty) || 0;
    const p = Number(this.Booking.Price) || 0;
    const c = Number(this.Booking.Carriage) || 0;
    this.Booking.Bags = q * 20;   // 1 ton = 20 bags
    this.Booking.Amount = q * p + c;
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

  // Delete a booking by ID. Removes from UI immediately, then deletes on server.
  deleteBooking(bookingID: any, isPosted: any) {
    if (!bookingID) return;
    // Remove from frontend immediately
    this.savedBookings = this.savedBookings.filter((bk: any) => bk.BookingID !== bookingID);
    // Delete on server
    this.http.postTask('delete', { ID: bookingID, Table: 'B' }).then(() => {
      this.myToaster.Sucess('Booking deleted', 'Deleted');
      this.LoadSavedBookings();
      this.loadProductsAndStock();
    }).catch((er) => {
      const msg = (er && er.error && er.error.message) || (er && er.message) || 'Error while deleting booking';
      this.myToaster.Error(msg, 'Error');
      this.LoadSavedBookings();
    });
  }

  PurchaseBooking() {
    // Allow saving if there are booking items OR a single booking is filled via Booking fields
    if (!this.BookingItems.length && (!this.Booking.ProductID || !this.Booking.Qty || Number(this.Booking.Qty) <= 0)) {
      this.myToaster.Error('Please add at least one item before saving.', 'Validation Error');
      return;
    }

    let details: any[] = [];
    let supplierId = '';
    let totalBags = 0;
    let totalQty = 0;

    if (this.BookingItems && this.BookingItems.length > 0) {
      details = this.BookingItems.map(it => ({
        ProductID: it.ProductID,
        ProductName: it.ProductName,
        Qty: it.Qty,
        Bags: it.Bags,
        Price: it.Rate,
        Carriage: it.Carriage,
        Amount: it.Amount,
        Packing: 20,
        Type: 1,
      }));
      supplierId = this.BookingItems[0].SupplierID || '';
      totalBags = this.BookingItems.reduce((s, it) => s + (Number(it.Bags) || 0), 0);
      totalQty = this.BookingItems.reduce((s, it) => s + (Number(it.Qty) || 0), 0);
    } else {
      // single booking from Booking fields
      const qty = Number(this.Booking.Qty) || 0;
      const bags = Number(this.Booking.Bags) || qty * 20;
      details = [
        {
          ProductID: this.Booking.ProductID,
          ProductName: this.Booking.ProductName || this.getProductName(this.Booking.ProductID),
          Qty: qty,
          Bags: bags,
          Price: Number(this.Booking.Price) || 0,
          Carriage: Number(this.Booking.Carriage) || 0,
          Amount: Number(this.Booking.Amount) || 0,
          Packing: 20,
          Type: 1,
        },
      ];
      supplierId = this.Booking.SupplierID || '';
      totalBags = bags;
      totalQty = qty;
      // ensure BookingTotals are computed in case they weren't
      this.BookingTotals.TotalAmount = Number(this.Booking.Amount) || (qty * (Number(this.Booking.Price) || 0));
      this.BookingTotals.Carriage = Number(this.Booking.Carriage) || 0;
      this.BookingTotals.NetAmount = this.BookingTotals.TotalAmount + this.BookingTotals.Carriage;
    }

    const payload = {
      Date: JSON2Date(this.BookingDate),
      SupplierID: supplierId,
      VehicleNo: this.Booking.TransportVehicleNo || '',
      Amount: this.BookingTotals.TotalAmount,
      Carriage: this.BookingTotals.Carriage,
      NetAmount: this.BookingTotals.NetAmount,
      BagsPurchase: totalBags,
      DtCr: 'Dr',
      details: details,
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
