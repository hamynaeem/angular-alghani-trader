import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  selector: 'ft-search-control',
  template: `
    <ng-select
      #ngSelect
      class="custom"
      [items]="data$ | async"
      [trackByFn]="trackByFn"
      [clearable]="true"
      [minTermLength]="minLengthTerm"
      [loading]="isLoading"
      [(ngModel)]="model"
      [bindValue]="bindValue"
      [bindLabel]="bindLabel"
      typeToSearchText="Please enter {{ minLengthTerm }} or more characters"
      [typeahead]="dataInput$"
      (change)="ItemSelected($event)"
      (click)="onItemClick($event)"
    >
    </ng-select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchControlComponent),
      multi: true,
    },
  ],
})
export class SearchControlComponent implements OnInit, ControlValueAccessor {
  @ViewChild('ngSelect') ngSelect: NgSelectComponent;
  @Input() Table = 'products';
  @Input() TermLength = 3;
  @Input() bindValue = '';
  @Input() bindLabel = '';
  @Input() TrackByKey: string = '';
  @Input() model: any = null;
  @Output() OnSelect: EventEmitter<any> = new EventEmitter<any>();

  data$: Observable<any>;
  isLoading = false;
  dataInput$ = new Subject<string>();
  minLengthTerm = 3;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private http: HttpClient, private http2: HttpBase) {}

  ngOnInit() {
    this.loadData();
    this.minLengthTerm = this.TermLength;
  }

  trackByFn(index: number, item: any): any {
    return item && this.TrackByKey ? item[this.TrackByKey] : index;
  }

  loadData() {
    this.data$ = concat(
      of([]), // default items
      this.dataInput$.pipe(
        filter((res) => res !== null && res.length >= this.minLengthTerm),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.isLoading = true)),
        switchMap((term) =>
          this.getData(term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.isLoading = false))
          )
        )
      )
    );
  }

  getData(term: string | null = null): Observable<any> {
    return this.http.get<any>(`${INSTANCE_URL}apis/${this.Table}/${term}`).pipe(
      map((resp) => {
        if (resp.Error) {
          throwError(() => new Error(resp.Error));
        } else {
          return resp;
        }
      })
    );
  }

  ItemSelected(value: any) {
    const selectedValue = value ? value[this.bindValue] : null;
    this.onChange(selectedValue); // Notify Angular forms
    this.OnSelect.emit(value); // Emit event on selection
  }

  onItemClick(event: any) {
    if (this.ngSelect.selectedItems.length) {
      const value = this.ngSelect.selectedItems[0];
      this.OnSelect.emit(value); // Emit event on click
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.ngSelect) {
      this.ngSelect.setDisabledState(isDisabled);
    }
  }
}
