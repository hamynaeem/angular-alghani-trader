import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { concat, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { INSTANCE_URL } from '../../constants/constants';
import { HttpBase } from '../services/httpbase.service';

@Component({
  selector: 'ft-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, AfterViewInit {
  @ViewChild('ngSelect') ngSelect: NgSelectComponent;
  @Input() Table = 'products';
  @Input() Term = '';
  @Input() Filter = '1=1';
  @Input() TermLength = 3;

  @Input() Fields = [
    {
      fldName: 'PCode',
      label: 'Barcode',
      search: true,
    },
    {
      fldName: 'ProductName',
      label: 'Product',
      search: true,
    },
    {
      fldName: 'SPrice',
      label: 'Price',
    },
  ];

  @Output() Event: EventEmitter<any> = new EventEmitter<any>();

  data$: Observable<any>;
  isLoading = false;
  dataInput$ = new Subject<string>();
  selectedItem: any;
  minLengthTerm = 3;

  constructor(private http: HttpClient, private http2: HttpBase) {}

  ngOnInit() {
    this.loaData();
    this.minLengthTerm = this.TermLength;
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.ngSelect.focus();
      this.ngSelect.searchTerm = this.Term;
      if(this.TermLength >0 && this.Term.length>this.TermLength)
        this.loaData();
      else {
        this.dataInput$.next(this.Term);
      }
    }, 500);
  }
  Selected(e) {
    this.Event.emit({ data: e, res: 'selected' });
  }

  Clicked(e) {
    console.log(e);

    if (e.action == 'ok') {
      this.Event.emit({ data: e.data, res: 'ok' });
    }
  }

  trackByFn(item: any) {
    return item.ProductID;
  }

  loaData() {
    this.data$ = concat(
      of([]), // default items
      this.dataInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.isLoading = true)),
        switchMap((term) => {
          return this.getData(term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.isLoading = false))
          );
        })
      )
    );
  }

  getData(term: string | null = null): Observable<any> {
    let filter = this.Fields.filter((x) => x.search == true)
      .map((x) => x.fldName)
      .join(" like '%" + term + "%' Or ");
    filter += " like '%" + term + "%' "
    if (this.Filter ) {
      if (filter.length > 0) {
        filter += " and ";
      }
      filter +=  this.Filter;
    }

    // console.log(filter);

    return this.http
      .get<any>(
        INSTANCE_URL +
          'apis/' +
          this.Table +
          '?bid=' +
          this.http2.getBusinessID() +
          "&limit=10&filter=(" + filter + ")"
      )
      .pipe(
        map((resp) => {
          if (resp.Error) {
            throwError(() => new Error(resp.Error));
          } else {
            return resp;
          }
        })
      );
  }

  ItemSelected(e: any) {
    this.Event.emit({ data: e, res: 'ok' });
  }
}
