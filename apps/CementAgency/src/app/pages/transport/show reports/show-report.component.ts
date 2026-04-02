import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-show-report',
  templateUrl: './show-report.component.html',
  styleUrls: ['./show-report.component.scss'],
})
export class ShowReportComponent implements OnInit {
  public reports: any[] = [];
  Vehicles: any = [];

  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.http
      .getData('transportdetails?orderby=ID')
      .then((r: any) => {
        const ensureVehicles =
          this.Vehicles && this.Vehicles.length > 0
            ? Promise.resolve(this.Vehicles)
            : this.http.getData('transports');

        ensureVehicles.then((vehicles: any[]) => {
          this.Vehicles = vehicles;
          this.reports = (r || []).map((row: any) => {
            const vehicle = (this.Vehicles || []).find(
              (x: any) => x.TransportID == row.TransportID
            );
            const description = row.Description || row.Details || '';
            let categories: string[] = [];

            if (row.Categories && Array.isArray(row.Categories)) {
              categories = row.Categories;
            } else if (
              row.CategoriesString &&
              typeof row.CategoriesString === 'string'
            ) {
              categories = row.CategoriesString
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
            } else if (row.Categories && typeof row.Categories === 'string') {
              categories = row.Categories
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
            }

            return Object.assign({}, row, {
              TransportName: vehicle ? vehicle.TransportName : '',
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

  deleteReport(r: any) {
    const id = r.ID || r.id;
    if (!id) return;
    if (!confirm('Delete this transport record?')) return;
    this.http
      .Delete('transportdetails', id.toString())
      .then(() => {
        this.alert.Sucess('Record deleted', 'Delete', 1);
        this.loadReports();
      })
      .catch(() => {
        this.alert.Error('Delete failed', 'Error', 1);
      });
  }

  editReport(r: any) {
    const id = r.ID || r.id;
    if (!id) return;
    this.router.navigate(['/transport/expense/', id]);
  }
}
