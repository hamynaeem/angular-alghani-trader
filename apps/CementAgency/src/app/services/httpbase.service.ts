import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../environments/environment';
import { ModalContainerComponent } from '../pages/components/modal-container/modal-container.component';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class HttpBase {
  apiUrl = environment.INSTANCE_URL;
  bsModalRef: BsModalRef;
  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private auth: AuthenticationService
  ) {}

  getData(table, param: any = {}) {
    let params = new HttpParams();
    if (typeof param === 'string') {
      params = new HttpParams().set('filter', param);
    }
    params = this.toHttpParams(param);

    // console.log(param);

    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + 'apis/' + table, { headers: this.jwt(), params })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  getTask(ApiEndPoint, param: any = {}) {
    let params = new HttpParams();
    if (typeof param === 'string') {
      params = new HttpParams().set('filter', param);
    }
    params = this.toHttpParams(param);
    // console.log(param);

    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + 'tasks/' + ApiEndPoint, {
          headers: this.jwt(),
          params,
        })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  Delete(table: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + 'apis/delete/' + table + '/' + id, {
          headers: this.jwt(),
        })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  getStock(StoreID = '') {
    let filter = '';
    if (StoreID != '') {
      filter = 'filter=StoreID =' + StoreID;
    }
    return this.getData(
      'qrystock?flds=ProductID,ProductName,Stock,SPrice,PPrice,Packing,UnitValue as UnitValue&' +
        filter +
        '&orderby=ProductName'
    );
  }

  getUsers() {
    return this.getData('users');
  }

  delTask(table, id) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + 'tasks/' + table + '/' + id, { headers: this.jwt() })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  postData(url, data) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      this.http
        .post(this.apiUrl + 'apis/' + url, data, { headers: this.jwt() })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }
  DataTable(table, data): any {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      this.http
        .post(this.apiUrl + 'datatables/' + table, data, {
          headers: this.jwt(),
        })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  getReport(filter) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      this.http
        .get(this.apiUrl + 'reports/' + filter, { headers: this.jwt() })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  postTask(url, data) {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      data.BusinessID = this.getBusinessID();

      // Some backend responses (proxied or plain text) may return HTTP 200
      // but with non-JSON body which causes HttpClient to throw a parse error
      // and surface as an HttpErrorResponse with status 200. To handle that
      // gracefully we request the response as text and attempt to parse it
      // as JSON; if parsing fails we resolve with the raw text.
      this.http
        .post(this.apiUrl + 'tasks/' + url, data, {
          headers: this.jwt(),
          params,
          responseType: 'text' as 'json',
        })
        .subscribe({
          next: (resRaw: any) => {
            // resRaw is text (or JSON string). Try to parse, otherwise return as-is
            try {
              const parsed = typeof resRaw === 'string' ? JSON.parse(resRaw) : resRaw;
              resolve(parsed);
            } catch (ex) {
              resolve(resRaw);
            }
          },
          error: (err) => {
            // Sometimes HttpClient surfaces parse errors as HttpErrorResponse
            // with status === 200 and err.error containing the raw text.
            if (err && err.status === 200 && typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                resolve(parsed);
                return;
              } catch (ex) {
                resolve(err.error);
                return;
              }
            }
            reject(err);
          },
        });
    });
  }

  toHttpParams(obj): HttpParams {
    let params = new HttpParams();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key];
        if (val !== null && val !== undefined) {
          params = params.append(key, val.toString());
        }
      }
    }
    return params;
  }

  getBusinessID() {
    return this.geBranchData().businessid;
  }
  geBranchData() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').userdata;
  }
  getClosingDate() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').date;
  }
  getUserGroup() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').rights;
  }
  getUserMenu() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').UserMenu;
  }
  getUserID() {
    return this.geBranchData().userid;
  }

  getCustomers(t: string) {
    return this.getData('customers?filter=customer_type=' + t);
  }

  getAgents() {
    return this.getData('agents?filter=status=1');
  }

  openForm(form: any, formData: any = {}) {
    return this.openModal(ModalContainerComponent, {
      form: form,
      formdata: formData,
    });
  }

  openModal(Component, InitState: any = {}) {
    const initialState: ModalOptions = {
      initialState: InitState,
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(Component, initialState);

    return new Promise((resolve, reject) => {
      this.bsModalRef.content.Event.subscribe((res) => {
        if (res.res == 'save') {
          resolve('save');
          this.bsModalRef?.hide();
        } else if (res.res == 'cancel') {
          resolve('cancel');
          this.bsModalRef?.hide();
        }
      });
    });
  }

  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.token) {
      const headers = new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, PUT, POST',
        Authorization: 'Bearer ' + currentUser.token,
      });
      return headers;
    }
  }

  ProductsAll() {
    return this.getData(
      'products?flds=ProductID,ProductName&orderby=ProductName'
    );
  }

  getAcctstList(type = '') {
    let filter = '';
    if (type != '') {
      filter = '&filter=AcctTypeID=' + type;
    }
    return this.getData(
      'customers?flds=CustomerName,Balance,Address,CustomerID&orderby=CustomerName' +
        filter
    );
  }
  getClosingID() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').closingid;
  }
  GetBData(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}').bdata;
  }

  PrintSaleInvoice(InvoiceID) {
    window.open(
      '/#/print/printinvoice/' + InvoiceID,
      '_blank',
      'toolbar=1, scrollbars=1, resizable=1, width=' + 600 + ', height=' + 800
    );
  }
  PrintThermal(InvoiceID) {
    window.open(
      '/#/print/thermalinvoice/' + InvoiceID,
      '_blank',
      'toolbar=1, scrollbars=1, resizable=1, width=' + 400 + ', height=' + 800
    );
  }
  PrintPurchaseInvoice(InvoiceID) {
    window.open(
      '/#/print/printpurchase/' + InvoiceID,
      '_blank',
      'toolbar=1, scrollbars=1, resizable=1, width=' + 600 + ', height=' + 800
    );
  }
  PrintSaleGatePass(InvoiceID, store) {
    window.open(
      '/#/print/gatepass/' + InvoiceID + '/' + store,
      '_blank',
      'toolbar=1, scrollbars=1, resizable=1, width=' + 800 + ', height=' + 800
    );
  }
}
