import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { HttpBase } from "../services/httpbase.service";
import { MyToastService } from "../services/toaster.server";


@Component({
  selector: "ft-formly-form",
  templateUrl: "./formly-form.component.html",
  styleUrls: ["./formly-form.component.scss"],
})
export class FormlyFormComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename

  @Input("Form") form: any = {};
  @Input("formdata") formdata: any = {};
  @Input("submitbutton") submitbutton = 'Save';
  @Input("iscancel") iscancel = true;
  @Input() CrudButtons = true;

  @Output() ItemChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() DataSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() Cancelled: EventEmitter<any> = new EventEmitter<any>();
  public event: EventEmitter<any> = new EventEmitter();
  //public formdata: any = {};
  files: File | null;
  formGrp = new FormGroup({});




  constructor(
    private http: HttpBase,
    private myToast: MyToastService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit() {
    console.log(this.formdata);
   // this.formdata = Object.assign({}, this.FromData);
    // this.form.columns.forEach((col) => {
    //   if (col.hasOwnProperty("listTable") && col.listTable != "") {
    //     this.http.getData(col.listTable + "?flds=" + col.valueFld + "," + col.displayFld + "&orderby=" + col.displayFld).then((res: any) => {
    //       col.listData = res;
    //     });
    //   }
    // });
  }
  onSelect(event) {
    this.files = event.addedFiles[0];
  }
  SaveData() {
    if (this.files) {
      let filedata = new FormData();
      filedata.append("file", this.files);
      this.http
        .postData("uploadfile", filedata)
        .then((r: any) => {
          let filecolumn = this.form.columns.find((x) => {
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
        this.myToast.Error(err.message);
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

  LogIt(a:any){
    console.log(a);
  }
}
