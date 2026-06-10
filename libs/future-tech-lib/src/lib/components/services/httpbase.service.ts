import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { INSTANCE_URL } from "../../constants/constants";
import { ModalContainerComponent } from "../modal-container/modal-container.component";

@Injectable()
export class HttpBase {


  apiUrl = INSTANCE_URL;
  bsModalRef: BsModalRef;
  constructor(
    private http: HttpClient,
    private modalService: BsModalService,
    ) { }

    getData(table: string, param: any = {}) {
      let params = new HttpParams();

      if (param) {
        if (typeof param === 'string') {
          params = new HttpParams().set('filter', param);
        } else {
          params = this.toHttpParams(param);
        }
      }

      if (!(params.has('bid') || table.includes('bid'))) {
        if ( this.getBusinessID())
          params = params.set('bid', this.getBusinessID());
      }

      const headers = this.jwt(); // Replace with your authorization headers as needed

      return new Promise((resolve, reject) => {
          // Request as text so consuming code doesn't get an HttpErrorResponse
          // when the backend returns HTML (PHP warnings) alongside JSON.
          this.http
            .get(this.apiUrl + 'apis/' + table, { headers: this.jwt(), params, responseType: 'text' as 'json' })
            .subscribe({
              next: (resRaw: any) => {
                try {
                  if (typeof resRaw === 'string') {
                    const parsed = JSON.parse(resRaw);
                    resolve(parsed);
                    return;
                  }
                  resolve(resRaw);
                } catch (ex) {
                  try {
                    const txt = typeof resRaw === 'string' ? resRaw : JSON.stringify(resRaw);
                    const firstArr = txt.indexOf('[');
                    const lastArr = txt.lastIndexOf(']');
                    if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
                      const candidate = txt.substring(firstArr, lastArr + 1);
                      const parsed2 = JSON.parse(candidate);
                      resolve(parsed2);
                      return;
                    }
                    const firstObj = txt.indexOf('{');
                    const lastObj = txt.lastIndexOf('}');
                    if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
                      const candidate = txt.substring(firstObj, lastObj + 1);
                      const parsed3 = JSON.parse(candidate);
                      resolve(parsed3);
                      return;
                    }
                  } catch (ex2) {
                    // ignore
                  }
                  try {
                    const snippet = (typeof resRaw === 'string' ? resRaw : JSON.stringify(resRaw)).slice(0, 2000);
                    console.error('libs.httpbase.getData: failed to parse JSON, returning raw text. snippet:', snippet);
                  } catch (logErr) {}
                  resolve(resRaw);
                }
              },
              error: (err: any) => {
                if (err && err.status === 200 && typeof err.error === 'string') {
                  try {
                    const parsed = JSON.parse(err.error);
                    resolve(parsed);
                    return;
                  } catch (ex) {
                    try {
                      const txt = err.error;
                      const f = txt.indexOf('[');
                      const l = txt.lastIndexOf(']');
                      if (f !== -1 && l !== -1 && l > f) {
                        const candidate = txt.substring(f, l + 1);
                        const parsed2 = JSON.parse(candidate);
                        resolve(parsed2);
                        return;
                      }
                      const fo = txt.indexOf('{');
                      const lo = txt.lastIndexOf('}');
                      if (fo !== -1 && lo !== -1 && lo > fo) {
                        const candidate = txt.substring(fo, lo + 1);
                        const parsed3 = JSON.parse(candidate);
                        resolve(parsed3);
                        return;
                      }
                    } catch (e2) {
                      // ignore
                    }
                    try { console.error('libs.httpbase.getData: HttpErrorResponse with status 200. snippet:', err.error.slice(0,2000)); } catch(logErr){}
                    resolve(err.error);
                    return;
                  }
                }
                reject(err);
              },
              complete: () => {
              }
            });
      });
    }

  getTask(ApiEndPoint, param: any = {}) {
    let params = new HttpParams();
    if (typeof param === "string") {
      params = new HttpParams().set("filter", param);
    }
    params = this.toHttpParams(param);
    // console.log(param);

    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + 'tasks/' + ApiEndPoint, { headers: this.jwt(), params, responseType: 'text' as 'json' })
        .subscribe({
          next: (resRaw: any) => {
            try {
              if (typeof resRaw === 'string') {
                const parsed = JSON.parse(resRaw);
                resolve(parsed);
                return;
              }
              resolve(resRaw);
            } catch (ex) {
              try {
                const txt = typeof resRaw === 'string' ? resRaw : JSON.stringify(resRaw);
                const firstArr = txt.indexOf('[');
                const lastArr = txt.lastIndexOf(']');
                if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
                  const candidate = txt.substring(firstArr, lastArr + 1);
                  const parsed2 = JSON.parse(candidate);
                  resolve(parsed2);
                  return;
                }
                const firstObj = txt.indexOf('{');
                const lastObj = txt.lastIndexOf('}');
                if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
                  const candidate = txt.substring(firstObj, lastObj + 1);
                  const parsed3 = JSON.parse(candidate);
                  resolve(parsed3);
                  return;
                }
              } catch (ex2) {
                // ignore
              }
              try { console.error('libs.httpbase.getTask: failed to parse JSON, returning raw text. snippet:', (typeof resRaw === 'string' ? resRaw : JSON.stringify(resRaw)).slice(0,2000)); } catch(logErr){}
              resolve(resRaw);
            }
          },
          error: (err) => {
            if (err && err.status === 200 && typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                resolve(parsed);
                return;
              } catch (ex) {
                try {
                  const txt = err.error;
                  const f = txt.indexOf('[');
                  const l = txt.lastIndexOf(']');
                  if (f !== -1 && l !== -1 && l > f) {
                    const candidate = txt.substring(f, l + 1);
                    const parsed2 = JSON.parse(candidate);
                    resolve(parsed2);
                    return;
                  }
                  const fo = txt.indexOf('{');
                  const lo = txt.lastIndexOf('}');
                  if (fo !== -1 && lo !== -1 && lo > fo) {
                    const candidate = txt.substring(fo, lo + 1);
                    const parsed3 = JSON.parse(candidate);
                    resolve(parsed3);
                    return;
                  }
                } catch (e2) {
                  // ignore
                }
                try { console.error('libs.httpbase.getTask: HttpErrorResponse with status 200. snippet:', err.error.slice(0,2000)); } catch(logErr){}
                resolve(err.error);
                return;
              }
            }
            reject(err);
          }
        });
    });
  }

  Delete(table: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + "apis/delete/" + table + "/" + id, {
          headers: this.jwt(),
        })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  getUsers() {
    return this.getData("users");
  }

  delTask(table, id) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiUrl + "tasks/" + table + "/" + id, { headers: this.jwt() })
        .subscribe(
          (res) => {
            return resolve(res);
          },
          (err) => {
            return reject(err);
          }
        );
    });
  }

  postData(url, data) {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      data.BusinessID = this.getBusinessID();


      this.http
        .post(this.apiUrl + "apis/" + url, data, { headers: this.jwt() })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }
  DataTable(table, data): any {
    let params = new HttpParams();

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();
      let url = this.apiUrl + "datatables/" + table + ( this.getBusinessID()?  '/' + this.getBusinessID(): '');
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      this.http
        .post(url, data, { headers: this.jwt() })
        .subscribe({
          next: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }
  getSuppliers() {
    return  this.getData('qrysuppliers');
  }
  getReport(filter) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");

      this.http
        .get(this.apiUrl + "reports/" + filter, { headers: this.jwt() })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  postTask(url, data) {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      data.BusinessID = this.getBusinessID();

      this.http
        .post(this.apiUrl + "tasks/" + url, data, {
          headers: this.jwt(),
          params,
        })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
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
    return JSON.parse(localStorage.getItem("currentUser") || "{}").businessid;
  }
  geBranchData() {
    return JSON.parse(localStorage.getItem("currentUser") || "{}");
  }

  getUserData() {
    return JSON.parse(localStorage.getItem("currentUser") || "{}").userdata;
  }
  getClosingDate() {
    return JSON.parse(localStorage.getItem("currentUser") || "{}").date;
  }
  getUserID() {
    return this.geBranchData().userid;
  }

  getCustomers(t: string) {
    return this.getData('customers?filter=customer_type=' + t);
  }
  getProducts() {
    return this.getData("products?filter=status_id=1");
  }
  getAgents() {
    return this.getData("agents?filter=status=1");
  }


  openForm( form:any, formData:any= {}, Crud=true) {
    return this.openModal(ModalContainerComponent, {form: form, formdata: formData,CrudButtons: Crud });
  }


  openModal(Component, InitState:any={}) {

    const initialState: ModalOptions = {
      initialState: InitState,
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(
      Component,
      initialState
    );

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
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser && currentUser.token) {
      const headers = new HttpHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
        "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With",
        "Access-Control-Allow-Methods": "GET, PUT, POST",
        Authorization: "Bearer " + currentUser.token,
      });
      return headers;
    }
  }
  CreateInvoice(data) {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders();

      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      data.BusinessID = this.getBusinessID();

      this.http.post(this.apiUrl + 'orders/invoice', data, { headers: this.jwt(), params })
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });

  }
  getOrderCustomers(date, routeid = '0') {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + 'orders/customers/' + date + '/' + routeid, { headers: this.jwt(), params })
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
  getOrderOf(date, customerid) {
    let params = new HttpParams();
    params = this.toHttpParams({ bid: this.getBusinessID() });
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + 'orders/' + date + '/' + customerid, { headers: this.jwt(), params })
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });

  }

  getCustByType(rtid = '') {
    let filter = '';
    if (rtid !== '') {
      filter = ' AcctTypeID=' + rtid;
    }
    return this.getData('customers?flds=CustomerName,Balance,CustomerID,RouteID&orderby=CustomerName' +
      (filter === '' ? '' : '&filter=' + filter));
  }
  ProductsAll() {

    return this.getData('products?flds=ProductID,ProductName&orderby=ProductName');
  }
  getCustList(rt='') {
    return this.getData('customers?flds=CustomerName,Balance,CustomerID&orderby=CustomerName');
  }
  getClosingID() {
    return JSON.parse(localStorage.getItem('currentUser')||'{}').closingid;
  }
}
