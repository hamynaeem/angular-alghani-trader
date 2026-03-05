import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Injectable()
export class FTModalService {
  bsModalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  openForm(component: any, form: any, formData: any = {}) {
    return this.OpenModal(component, {
      form: form,
      formdata: formData,
    });
  }

  OpenForm2(
    component: any,
    form: any,
    formData: any = {},
    Crud = true
  ): BsModalRef {
    const initialState: ModalOptions = {
      initialState: { form: form, formdata: formData, CrudButtons: Crud },
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    return this.modalService.show(component, initialState);
  }
  OpenAsDialog(Component, InitState: any = {}) {
    const initialState: ModalOptions = {
      initialState: InitState,
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(Component, initialState);

    return this.bsModalRef;
  }
  OpenModal(Component, InitState: any = {}) {
    const initialState: ModalOptions = {
      initialState: InitState,
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(Component, initialState);

    return new Promise((resolve, reject) => {
      this.bsModalRef.content.Event.subscribe((res) => {
        if (res.res == 'save') {
          resolve('save');
          this.bsModalRef?.hide();
        } else if (res.res == 'cancel') {
          resolve('cancel');
          this.bsModalRef?.hide();
        }
      });
    });
  }
}
