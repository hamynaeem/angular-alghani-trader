import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ModalContainerComponent } from '../components/modal-container/modal-container.component';

@Injectable()
export class FTModalService {
  bsModalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  openForm(form: any, formData: any = {}) {
    return this.openModal(ModalContainerComponent, {
      form: form,
      formdata: formData,
    });
  }

  openForm2(form: any, formData: any = {}, Crud = true): BsModalRef {
    const initialState: ModalOptions = {
      initialState: { form: form, formdata: formData, CrudButtons: Crud },
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    return this.modalService.show(ModalContainerComponent, initialState);
  }
  openAsDialog(Component, InitState: any = {}) {
    const initialState: ModalOptions = {
      initialState: InitState,
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(Component, initialState);

    return this.bsModalRef;
  }
  openModal(Component, InitState: any = {}) {
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
