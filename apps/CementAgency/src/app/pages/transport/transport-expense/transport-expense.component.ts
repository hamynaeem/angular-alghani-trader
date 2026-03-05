import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { getCurDate, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { TransportDetail } from '../transport.model';

@Component({
  selector: 'app-transport-expense',
  templateUrl: './transport-expense.component.html',
  styleUrls: ['./transport-expense.component.scss'],
})
export class TransportExpenseComponent implements OnInit {
  @ViewChild('cmbCustomer') cmbCustomer: ElementRef | undefined;
  public showReports = false;
  public reports: any[] = [];
  private editingDetailID: number | null = null;
  public Voucher: TransportDetail;
  public newCategory: string = '';
  AcctTypes = [];
  EditID = '';
  public Ino = '';
  curVehicle: any = {};
  Products: any = [];
  Vehicles: any = [];
  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private router: Router,

    private activatedRoute: ActivatedRoute
  ) {
    this.Voucher = {
      Date: GetDateJSON(new Date(getCurDate())),
      TransportID: 0,
      Details: null,
      Income: 0,
      Expense: 0,
      Categories: [],
    };
  }

  ngOnInit() {
    this.Cancel();

    this.LoadVehicles();

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.EditID) {
        this.EditID = params.EditID;
        this.Ino = this.EditID;
        this.http
          .getData('qryvouchers?filter=VoucherID=' + this.EditID)
          .then((r: any) => {
            this.Voucher = r[0];
            this.Voucher.Date = GetDateJSON(new Date(r[0].Date));
            this.GetVehicle(this.Voucher.TransportID);
          });
      } else {
        this.EditID = '';
      }
      console.log(this.EditID);
    });
  }
  canSave() {
    return (
      this.Voucher &&
      this.Voucher.TransportID &&
      this.Voucher.TransportID !== 0 &&
      this.Voucher.Expense > 0
    );
  }

  ShowReports() {
    // Toggle report panel and load data. If a vehicle is selected, filter by it; otherwise load all.
    this.showReports = !this.showReports;
    if (this.showReports) {
      let endpoint = 'transportdetails?orderby=ID';
      if (this.Voucher && this.Voucher.TransportID && this.Voucher.TransportID !== 0) {
        endpoint = 'transportdetails?filter=TransportID=' + this.Voucher.TransportID + '&orderby=ID';
      }
      this.http
        .getData(endpoint)
        .then((r: any) => {
          // ensure Vehicles list is available to map TransportID -> TransportName
          const ensureVehicles = (this.Vehicles && this.Vehicles.length > 0)
            ? Promise.resolve(this.Vehicles)
            : this.http.getData('transports');

          ensureVehicles.then((vehicles: any[]) => {
            this.Vehicles = vehicles;
            this.reports = (r || []).map((row: any) => {
              const v = (this.Vehicles || []).find((x: any) => x.TransportID == row.TransportID);
              // normalize description and categories
              const description = row.Description || row.Details || '';
              let categories: string[] = [];
              if (row.Categories && Array.isArray(row.Categories)) {
                categories = row.Categories;
              } else if (row.CategoriesString && typeof row.CategoriesString === 'string') {
                categories = row.CategoriesString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
              } else if (row.Categories && typeof row.Categories === 'string') {
                // sometimes API returns a comma-separated string in Categories
                categories = row.Categories.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
              }

              return Object.assign({}, row, {
                TransportName: v ? v.TransportName : '',
                Description: description,
                Categories: categories,
              });
            });
          });
        })
        .catch(() => {
          this.reports = [];
        });
    }
  }
  async FindINo() {
    let voucher: any = await this.http.getData('transportdetails/' + this.Ino);
    if (voucher.Expense > 0)
      this.router.navigate(['/transport/expense/', this.Ino]);
    else this.router.navigate(['/transport/expense/', this.Ino]);
  }
  LoadVehicles() {
    console.log('in vehicles');

    this.http.getData('transports').then((r: any) => {
      this.Vehicles = r;
    });
  }


  SaveData() {
    let voucherid = '';

    this.Voucher.Date = JSON2Date(this.Voucher.Date);
    if (this.EditID != '') {
      voucherid = '/' + this.EditID;
    }

    console.log(this.Voucher);
    const doPost = () =>
      this.http.postTask('transportvoucher' + voucherid, this.Voucher);

    // If we are editing an existing transport detail, delete it first then post new
    if (this.editingDetailID) {
      this.http
        .Delete('transportdetails', this.editingDetailID.toString())
        .then(() => doPost())
        .then(() => {
          this.alert.Sucess('Expense Saved', 'Save', 1);
          this.editingDetailID = null;
          if (this.EditID != '') {
            this.router.navigateByUrl('/transport/expense/');
          } else {
            this.Cancel();
          }
          // refresh reports if visible
          if (this.showReports) this.ShowReports();
        })
        .catch((err) => {
          this.Voucher.Date = GetDateJSON();
          console.log(err);
          this.alert.Error(err.error.message, 'Error', 1);
        });
    } else {
      doPost()
        .then(() => {
          this.alert.Sucess('Expense Saved', 'Save', 1);
          if (this.EditID != '') {
            this.router.navigateByUrl('/transport/expense/');
          } else {
            this.Cancel();
          }
          if (this.showReports) this.ShowReports();
        })
        .catch((err) => {
          this.Voucher.Date = GetDateJSON();
          console.log(err);
          this.alert.Error(err.error.message, 'Error', 1);
        });
    }
  }

  editReport(r: any) {
    // populate form with report row values for editing
    this.editingDetailID = r.ID || r.id || null;
    this.Voucher.Date = GetDateJSON(new Date(r.Date));
    this.Voucher.TransportID = r.TransportID;
    this.Voucher.Details = r.Description || r.Details;
    this.Voucher.Expense = r.Expense || 0;
    this.Voucher.Income = r.Income || 0;
    // populate categories if available
    if (r.Categories && Array.isArray(r.Categories)) {
      this.Voucher.Categories = r.Categories;
    } else if (r.CategoriesString && typeof r.CategoriesString === 'string') {
      this.Voucher.Categories = r.CategoriesString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length>0);
    } else {
      this.Voucher.Categories = [];
    }
    // scroll to form or ensure visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteReport(r: any) {
    const id = r.ID || r.id;
    if (!id) return;
    if (!confirm('Delete this transport record?')) return;
    this.http
      .Delete('transportdetails', id.toString())
      .then(() => {
        this.alert.Sucess('Record deleted', 'Delete', 1);
        // refresh reports
        if (this.showReports) this.ShowReports();
      })
      .catch(() => {
        this.alert.Error('Delete failed', 'Error', 1);
      });
  }
  GetVehicle(VehicleID: any) {
    console.log(VehicleID);

    if (VehicleID && VehicleID !== '') {
      this.http
        .getData('transports?filter=TransportID=' + VehicleID)
        .then((r: any) => {
          this.curVehicle = r[0];
        });
    }
  }
  Round(amnt: number) {
    return Math.round(amnt);
  }

  Cancel() {
    this.Voucher = {
      Date:  GetDateJSON(new Date(getCurDate())),
      TransportID: 0,
      Details: null,
      Income: 0,
      Expense: 0,
      Categories: [],
    };

    this.router.navigateByUrl('/transport/expense');
  }

  addCategory() {
    if (!this.newCategory || !this.newCategory.trim()) return;
    const v = this.newCategory.trim();
    if (!this.Voucher.Categories) this.Voucher.Categories = [];
    if (this.Voucher.Categories.indexOf(v) === -1) {
      this.Voucher.Categories.push(v);
    }
    this.newCategory = '';
  }

  removeCategory(idx: number) {
    if (!this.Voucher.Categories) return;
    if (idx > -1 && idx < this.Voucher.Categories.length) {
      this.Voucher.Categories.splice(idx, 1);
    }
  }
}
