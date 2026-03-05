import { Injectable, VERSION } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService, ToastrConfig } from 'ngx-toastr';
import { ModalContainerComponent } from '../modal-container/modal-container.component';

@Injectable({
    providedIn: 'root', // or provide it in a specific module
  })
export class ModalService {
  bsModalRef: BsModalRef;
  constructor(private bsModalService: BsModalService) {}
  openForm(form: any, formData: any = {}) {
    const initialState: ModalOptions = {
      initialState: {
        form: form,
        formdata: formData,
      },
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.bsModalService.show(form, initialState);
    
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
    openModal(Component, InitState: any = {}) {
        const initialState: ModalOptions = {
          initialState: InitState,
          class: 'modal-lg',
          backdrop: true,
          ignoreBackdropClick: true,
        };
        return  this.bsModalService.show(Component, initialState);
      }
  }
