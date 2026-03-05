import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { HttpBase } from "../../../services/httpbase.service";
import { MyToastService } from "../../../services/toaster.server";

@Component({
  selector: "app-crud-form",
  templateUrl: "./crud-form.component.html",
  styleUrls: ["./crud-form.component.scss"],
})
export class CrudFormComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input() form: any;
  @Input() formdata: any = {};

  @Output() ItemChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() DataSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() Cancelled: EventEmitter<any> = new EventEmitter<any>();
  public event: EventEmitter<any> = new EventEmitter();
  //public formdata: any = {};
  files: File | null = null;

  constructor(
    private http: HttpBase,
    private myToast: MyToastService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit() {
    console.log(this.formdata);
   // this.formdata = Object.assign({}, this.FromData);
    this.form.columns.forEach((col: any) => {
      if (col.listTable && typeof col.listTable === 'string' && col.listTable.trim() !== '') {
        this.http.getData(col.listTable + "?flds=" + col.valueFld + "," + col.displayFld).then((res: any) => {
          col.listData = res;
        });
      }
    });
  }
  onSelect(event: any) {
    this.files = event.addedFiles[0];
  }
  SaveData() {
    if (this.files) {
      let filedata = new FormData();
      filedata.append("file", this.files);
      this.http
        .postData("uploadfile", filedata)
        .then((r: any) => {
          let filecolumn = this.form.columns.find((x: any) => {
            return x.control === "file";
          });
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
  SendData() {
    let pk = "";
    if (this.formdata[this.form.pk]) {
      pk = "/" + this.formdata[this.form.pk];
    }
    console.log(this.formdata);

    this.http
      .postData(this.form.tableName + pk, this.formdata)
      .then((r) => {
        this.DataSaved.emit({ data: r });
      })
      .catch((err) => {
        this.myToast.Error(err.message, 1);
      });
  }
  onRemove() {
    this.files = null;
  }

  getformdata(object: any) {
    const formdata = new FormData();
    Object.keys(object).forEach((key) => formdata.append(key, object[key]));
    return formdata;
  }

  Changed(fld: any, val: any) {
    console.log(fld, val);
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

  public setDataSource(idx: any, data: any) {
    this.form[idx].listData = [...data];
  }

  LogIt(a:any){
    console.log(a);
  }
}
