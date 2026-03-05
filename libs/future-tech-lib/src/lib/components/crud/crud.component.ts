import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { UPLOADS_URL } from '../../constants/constants';
import { HttpBase } from '../services/httpbase.service';
import { MyToastService } from '../services/toaster.server';

@Component({
  selector: 'ft-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, OnDestroy {
  @ViewChild('dataList') dataList;

  @Input() form: any;
  @Input() list: any;
  @Input() Actions = ['edit', 'add', 'delete'];
  @Input() formdata: any = {};
  @Input() Filter = '';

  public formEditIDX = -1;
  public listData: any;
  public Upload_path = UPLOADS_URL;

  files: File | any;
  dtTrigger = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  bsModalRef?: BsModalRef;

  constructor(private http: HttpBase, private toastr: MyToastService) {}

  ngOnInit() {
    this.list.actions = [];
    this.list.crud = true;
    this.Actions.forEach((a) => {
      if (a == 'edit') {
        this.list.actions.push({
          action: 'edit',
          title: 'Edit',
          icon: 'pencil',
          class: 'primary',
        });
      } else if (a == 'delete') {
        this.list.actions.push({
          action: 'delete',
          title: 'Delete',
          icon: 'trash',
          class: 'danger',
        });
      }
      console.log(a);
    });

    let pkcol = this.list.columns.filter((col) => {
      return col.data == this.list.pk;
    });
    console.log(pkcol);

    if (pkcol.length == 0) {
      this.list.columns.unshift({
        data: this.list.pk,
        label: 'ID',
        visible: false,
      });
    }
    console.log(this.list.columns);
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  Add() {
    this.AddData(Object.assign({}, this.formdata));
  }

  Clicked(e) {
    if (e.action === 'edit') {
      this.http
        .getData(this.form.tableName + '/' + e.data[this.form.pk])
        .then((r: any) => {
          if (r.BusinessID == '0') {
            this.toastr.Error('You are not allowed to edit this record');
            return;
          } else {
            this.AddData(r);
          }
        });
    } else if (e.action === 'delete') {
      this.http
        .getData(this.form.tableName + '/' + e.data[this.form.pk])
        .then((r: any) => {
          if (r.BusinessID == '0') {
            this.toastr.Error('You are not allowed to delete this record');
            return;
          } else {
            this.Delete(e.data);
          }
        });
    }
  }
  AddData(data: any = {}) {
    this.http.openForm(this.form, data).then((r) => {
      if (r == 'save') {
        this.dataList.realoadTable();
        console.log(r);
      }
    });
  }
  public Delete(data) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.http.Delete(this.form.tableName, data[this.form.pk]).then(() => {
          this.dataList.realoadTable();
          Swal.fire('Deleted!', 'Your record is deleted.', 'success');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your record is safe :)', 'error');
      }
    });
  }
  onSelect(event) {
    this.files = event.addedFiles[0];
  }

  onRemove(event) {
    this.files = null;
  }

  getFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }
  public ChangeDataTable(sTableName, bReload = true) {
    this.list.tableName = sTableName;
    if (bReload) {
      this.dataList.realoadTable();
    }
  }
}
