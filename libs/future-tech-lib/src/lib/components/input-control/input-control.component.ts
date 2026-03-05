import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ft-input-control',
  template: `
    <div class="form-group">
      <label *ngIf="label">{{ label }}</label>
      <input [type]="type" class="form-control" [(ngModel)]="value"
      [readonly]="readonly" (ngModelChange)="onChange($event) "
      (focus)="$event.target.select()" [style.background-color]="bgcolor">
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputControlComponent),
      multi: true,
    },
  ],
})
export class InputControlComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() bgcolor: string = '#fff';


  @Input() onChange: (value: any) => void = () => {};
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  private _value: any;

  @Input()
  get value(): any {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
    this.onChange(val);
    this.valueChange.emit(val); // Emit the value change event
  }

  writeValue(value: any): void {
    this._value = value;
  }

  registerOnChange(fn: any): void {
    // This is the function that will be called when the value changes
    // You can use this to update the value in the parent component
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    // Implement if needed
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
