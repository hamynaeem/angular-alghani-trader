import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ComboBox } from '@syncfusion/ej2-angular-dropdowns';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { HttpBase } from '../services/httpbase.service';
import { MyToastService } from '../services/toaster.server';

@Component({
  selector: 'ft-crud-form',
  templateUrl: './crud-form.component.html',
  styleUrls: ['./crud-form.component.scss'],
})
export class CrudFormComponent implements OnInit, AfterContentInit {
  @ViewChild('userForm') userForm: NgForm;
  @ViewChildren('inputRef') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('combosList') combosList!: QueryList<ComboBox>;

  @Input('form') form: any = {};
  @Input() formdata: any = {};
  @Input() submitbutton = 'Save';
  @Input() iscancel = true;
  @Input() CrudButtons = true;

  @Output() ItemChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() DataSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() Cancelled: EventEmitter<any> = new EventEmitter<any>();
  @Output() BeforeSave: EventEmitter<any> = new EventEmitter<any>();
  @Output() ButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  public event: EventEmitter<any> = new EventEmitter();
  //public formdata: any = {};
  files: File | null;
  public FormData: any = {};

  constructor(
    private http: HttpBase,
    private myToast: MyToastService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit() {
    //this.formdata = Object.assign({}, this.formdata);
    console.log(this.formdata, this.form);
    this.FormData = this.formdata;

    this.form.columns.forEach((col) => {
      if (col.hasOwnProperty('listTable') && col.listTable.trim() != '') {
        console.log(col.listTable);
        this.http
          .getData(
            col.listTable +
              (col.listTable.indexOf('?') >= 0 ? '&' : '?') +
              'flds=' +
              col.valueFld +
              ',' +
              col.displayFld +
              '&orderby=' +
              col.displayFld
          )
          .then((res: any) => {
            if (col.listData && col.listData.length > 0) {
              col.listData = [...col.listData, ...res];
            } else {
              col.listData = res;
            }
            // console.log(col.listData);
          });
      }
    });
  }

  ngAfterContentInit() {}

  onSelect(event) {
    this.files = event.addedFiles[0];
  }
  public SaveData(): void {
    let event = { data: this.formdata, cancel: false };
    this.BeforeSave.emit(event);

    if (!event.cancel) {
      if (this.files) {
        let filecolumn = this.form.columns.find((x) => {
          return x.control === 'file';
        });
        let folder = '';
        if (filecolumn && filecolumn.hasOwnProperty('folder')) {
          folder = '/' + filecolumn.folder;
        }
        let filedata = new FormData();
        filedata.append('file', this.files);
        this.http
          .postData('uploadfile' + folder, filedata)
          .then((r: any) => {
            if (filecolumn) {
              this.formdata[filecolumn.fldName] = r.msg.file_name;
            }
            console.log(filecolumn);
            this.SendData();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.SendData();
      }
    }
  }
  SendData() {
    let pk = '';
    if (this.formdata[this.form.pk]) {
      pk = '/' + this.formdata[this.form.pk];
    }

    if (this.formdata[this.form.pk]) delete this.formdata[this.form.pk];
    console.log(this.formdata);

    this.http
      .postData(this.form.tableName + pk, this.formdata)
      .then((r) => {
        this.DataSaved.emit({ data: r });
      })
      .catch((err) => {
        this.myToast.Error(err.error.message);
      });
  }
  onRemove(event) {
    this.files = null;
  }

  getformdata(object) {
    const formdata = new FormData();
    Object.keys(object).forEach((key) => formdata.append(key, object[key]));
    return formdata;
  }

  Changed(fld, val) {
    //console.log(fld, val, this.CrudButtons);
    this.ItemChanged.emit({
      fldName: fld,
      value: val,
      form: this.form,
      model: this.formdata,
    });
    return false;
  }

  closeModal() {
    this.Cancelled.emit({ data: this.formdata });
  }

  public setDataSource(idx, data) {
    this.form[idx].listData = [...data];
  }
  public IsFormValid() {
    return this.userForm.valid;
  }

  LogIt(a: any) {
    console.log(a);
  }

  ButtonClickedEv(e) {
    console.log(e);

    if (e.col.OnClick) {
      e.col.OnClick(e);
    }
    this.ButtonClicked.emit(e);
  }

  public getAllInputs() {
    return this.inputs.toArray();
  }
  public getAllCombos() {
    return this.combosList.toArray();
  }
}
