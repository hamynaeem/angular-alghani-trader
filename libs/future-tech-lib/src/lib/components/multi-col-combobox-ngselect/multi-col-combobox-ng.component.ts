import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { concat, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  map,
  filter,
} from 'rxjs/operators';
import { HttpBase } from '../services/httpbase.service';
import { INSTANCE_URL } from '../../constants/constants';
import { ValueAccessorBase } from '../multi-col-combobox/value-accessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ft-multi-col-combobox-ng',
  templateUrl: './multi-col-combobox-ng.component.html',
  styleUrls: ['./multi-col-combobox-ng.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiColComboboxNgComponent),
      multi: true,
    },
  ],
})
export class MultiColComboboxNgComponent
  extends ValueAccessorBase<string>
  implements OnInit, AfterViewInit
{
  @ViewChild('ngSelect') ngSelect: NgSelectComponent;
  @Input() ApiEndPoint = '';
  @Input() BindVal = '';
  @Input() BindLabel = '';
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

  @Output() Change: EventEmitter<any> = new EventEmitter<any>();

  Term = '';
  data$: Observable<any>;
  isLoading = false;
  dataInput$ = new Subject<string>();
  selectedItem: any;
  minLengthTerm = 3;

  constructor(
    private http: HttpClient,
    private http2: HttpBase,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit() {
    this.loaData();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.ngSelect.focus();
      this.ngSelect.searchTerm = this.Term;
      if (this.Term.length > 2) {
        this.loaData();
      }
      console.log(this.Term);
    }, 500);
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
    filter += " like '%" + term + "%' ";
    // console.log(filter);

    return this.http
      .get<any>(
        INSTANCE_URL +
          'apis/' +
          this.ApiEndPoint +
          '?bid=' +
          this.http2.getBusinessID() +
          '&limit=10&filter=(' +
          filter +
          ')'
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
    this.Change.emit(e);
  }
}
