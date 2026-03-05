import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

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

constructor(private http: HttpClient, private http2: HttpBase) {
  this.apiroutes$ = this.http.get<any[]>(this.api + 'routes?bid=' + this.http2.getBusinessID());
  this.routes$ = this._routesData$.pipe(
    switchMap(() => this.apiroutes$),
    shareReplay(1)
  );

  this.apiStock$ = this.http.get<any[]>(this.api + 'qrystock?orderby=ProductName&bid=' + this.http2.getBusinessID());
  this.Stock$ = this._stockData$.pipe(
    switchMap(() => this.apiStock$),
    shareReplay(1)
  );

  this.apiSalesman$ = this.http.get<any[]>(this.api + 'salesman?bid=' + this.http2.getBusinessID());
  this.Salesman$ = this._salesmanData$.pipe(
    switchMap(() => this.apiSalesman$),
    shareReplay(1)
  );

  this.apiStores$ = this.http.get<any[]>(this.api + 'stores?bid=' + this.http2.getBusinessID());
  this.Stores$ = this._storesData$.pipe(
    switchMap(() => this.apiStores$),
    shareReplay(1)
  );

  this.apiAcctTypes$ = this.http.get<any[]>(this.api + 'accttypes?bid=' + this.http2.getBusinessID());
  this.AcctTypes$ = this._accttypesData$.pipe(
    switchMap(() => this.apiAcctTypes$),
    shareReplay(1)
  );

  this.apiCategories$ = this.http.get<any[]>(this.api + 'categories?bid=' + this.http2.getBusinessID());
  this.Categories$ = this._categories$.pipe(
    switchMap(() => this.apiCategories$),
    shareReplay(1)
  );

  this.apiProducts$ = this.http.get<any[]>(this.api + 'products?orderby=ProductName&bid=' + this.http2.getBusinessID());
  this.Products$ = this._products$.pipe(
    switchMap(() => this.apiProducts$),
    shareReplay(1)
  );

  this.apiAccounts$ = this.http.get<any[]>(this.api + 'qrycustomers?flds=CustomerID,CustomerName,AcctType,Balance&orderby=CustomerName');
  this.Accounts$ = this._accounts$.pipe(
    switchMap(() => this.apiAccounts$),
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
  public updateStock() {
    this._storesData$.next();
  }
}
