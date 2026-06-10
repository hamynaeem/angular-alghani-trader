import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, from } from 'rxjs';
import { shareReplay, switchMap, filter } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { HttpBase } from './httpbase.service';


@Injectable(
  {
    providedIn: 'root'
  }
)
export class CachedDataService {
  private api = environment.INSTANCE_URL + 'apis/';

//--------- routers list
private _routesData$ = new BehaviorSubject<void>(undefined);
public apiroutes$: any;
public routes$: any;

//------ stock list
private _stockData$ = new BehaviorSubject<void>(undefined);
private _stockRows$ = new BehaviorSubject<any[] | null>(null);
public apiStock$: any;
public Stock$: any;

//------ salesman list
private _salesmanData$ = new BehaviorSubject<void>(undefined);
public apiSalesman$: any;
public Salesman$: any;

//------ companies list
private _storesData$ = new BehaviorSubject<void>(undefined);
public apiStores$: any;
public Stores$: any;

//------ stores list
private _accttypesData$ = new BehaviorSubject<void>(undefined);
public apiAcctTypes$: any;
public AcctTypes$: any;

//------ categories
private _categories$ = new BehaviorSubject<void>(undefined);
public apiCategories$: any;
public Categories$: any;

//------ products
private _products$ = new BehaviorSubject<void>(undefined);
public apiProducts$: any;
public Products$: any;

//------ accounts
private _accounts$ = new BehaviorSubject<void>(undefined);
public apiAccounts$: any;
public Accounts$: any;

//------ suppliers
private _suppliers$ = new BehaviorSubject<void>(undefined);
public apiSuppliers$: any;
public Suppliers$: any;

  constructor(private http: HttpClient, private http2: HttpBase) {
  this.apiroutes$ = from(this.http2.getData('routes?bid=' + this.http2.getBusinessID()));
  this.routes$ = this._routesData$.pipe(
    switchMap(() => this.apiroutes$),
    shareReplay(1)
  );

  this.apiStock$ = from(this.http2.getData('qrystock?orderby=ProductName&bid=' + this.http2.getBusinessID()));
  // Stock$ emits either pushed rows (via setStockRows) or API-fetched rows when updateStock() is triggered
  this.Stock$ = merge(
    this._stockRows$.pipe(filter((r: any) => r !== null)),
    this._stockData$.pipe(switchMap(() => this.apiStock$))
  ).pipe(shareReplay(1));
  this.apiSalesman$ = from(this.http2.getData('salesman?bid=' + this.http2.getBusinessID()));
  this.Salesman$ = this._salesmanData$.pipe(
    switchMap(() => this.apiSalesman$),
    shareReplay(1)
  );
  this.apiStores$ = from(this.http2.getData('stores?bid=' + this.http2.getBusinessID()));
  this.Stores$ = this._storesData$.pipe(
    switchMap(() => this.apiStores$),
    shareReplay(1)
  );

  this.AcctTypes$ = this._accttypesData$.pipe(
    switchMap(() => from(this.http2.getData('accttypes?bid=' + this.http2.getBusinessID()))),
    shareReplay(1)
  );

  this.apiCategories$ = from(this.http2.getData('categories?bid=' + this.http2.getBusinessID()));
  this.Categories$ = this._categories$.pipe(
    switchMap(() => this.apiCategories$),
    shareReplay(1)
  );
  this.apiProducts$ = from(this.http2.getData('products?orderby=ProductName&bid=' + this.http2.getBusinessID()));
  this.Products$ = this._products$.pipe(
    switchMap(() => this.apiProducts$),
    shareReplay(1)
  );
  this.apiAccounts$ = from(this.http2.getData('qrycustomers?flds=CustomerID,CustomerName,AcctType,Balance&orderby=CustomerName'));
  this.Accounts$ = this._accounts$.pipe(
    switchMap(() => this.apiAccounts$),
    shareReplay(1)
  );
  this.apiSuppliers$ = from(this.http2.getData('qrysuppliers?orderby=SupplierName&bid=' + this.http2.getBusinessID()));
  this.Suppliers$ = this._suppliers$.pipe(
    switchMap(() => this.apiSuppliers$),
    shareReplay(1)
  );
}

  public updateRoutes() {
    this._routesData$.next();
  }
  public updateSalesman() {
    this._salesmanData$.next();
  }
  public updateComanies() {
    this._storesData$.next();
  }
  public updateAcctTypes() {
    this._accttypesData$.next();
  }
  public updateCategories() {
    this._categories$.next();
  }
  public updateProducts() {
    this._products$.next();
  }
  public updateAccounts() {
    this._accounts$.next();
  }
  public updateSuppliers() {
    this._suppliers$.next();
  }
  public updateStock() {
    this._stockData$.next();
  }
  // Allow explicit pushing of stock rows to shared observable
  public setStockRows(rows: any[]) {
    this._stockRows$.next(rows || []);
  }
}
