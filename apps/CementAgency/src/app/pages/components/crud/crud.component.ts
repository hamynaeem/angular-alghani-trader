import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import {
  BsModalRef,
  BsModalService,
  ModalOptions,
} from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { ModalContainerComponent } from '../modal-container/modal-container.component';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  @Input() form: any;
  @Input() list: any;
  @Input() Actions = ['edit', 'add', 'delete'];
  @Input() formdata: any = {};
  @Input() Filter = '';

  public data: any = [];
  // public formData: any = {};
  public formEditIDX = -1;
  public listData: any;
  public Upload_path = environment.UPLOADS_URL;

  private _formData: any;
  files: File | any;
  dtTrigger = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  bsModalRef?: BsModalRef;

  constructor(
    private http: HttpBase,
    private modalService: BsModalService,
    private myToast: MyToastService
  ) { }

  ngOnInit() {

    this.dtOptions = {
      pagingType: 'full_numbers'

    };

    this.http.getData(this.list.tableName + (this.Filter == ''? '': '?filter='+this.Filter)).then((r: any) => {
      this.data = r;
      console.log('Data is: ');
      console.log(this.data);
      this.dtTrigger.next();
    });

    console.log(this.list.columns);
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  Add() {
    this._formData = Object.assign({}, this.formdata);
    this.formEditIDX = -1;
    this.OpenModal(this._formData);
  }
  OpenModal(data) {
    // this.formEditIDX = -1;
    // this.formData = {};
    // this.formModal.show();

    const initialState: ModalOptions = {
      initialState: {
        form: this.form,
        formdata: data,
      },
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.bsModalRef = this.modalService.show(
      ModalContainerComponent,
      initialState
    );

    this.bsModalRef.content.Event.subscribe((res) => {
      console.log(res);
      if (res.res == 'save') {

        this.bsModalRef?.hide();
        if (this.list.tableName !== this.form.tableName) {
          this.http
            .getData(
              this.list.tableName +
              '?filter=' +
              this.list.pk +
              '=' +
              res.data[this.form.pk]
            )
            .then((r2: any) => {
              this.AddData(r2[0]);
            });
        } else {
          this.AddData(res.data);
        }
      } else if (res.res == 'cancel') {
        this.bsModalRef?.hide();
      }
    });
  }

  AddData(r: any) {
    if (this.formEditIDX === -1) {
      this.data.push(r);
    } else {
      this.data.splice(this.formEditIDX, 1, r);
    }

    console.log(this.data);
  }

  public Edit(idx) {
    this.formEditIDX = idx;
    this.http
      .getData(this.form.tableName + '/' + this.data[idx][this.form.pk])
      .then((r) => {

        this.OpenModal(r);
      });
  }
  public Delete(idx) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.http
          .Delete(this.form.tableName, this.data[idx][this.form.pk])
          .then(() => {
            this.data.splice(idx, 1);
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
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again

        this.http
          .getData(this.list.tableName)
          .then((r: any) => {
            this.data = r;
            this.dtTrigger.next();
          })
          .catch((err) => {
            Swal.fire('Error', 'Error whil eloading data :-(', 'error');
          });
      });
    }
  }
}
