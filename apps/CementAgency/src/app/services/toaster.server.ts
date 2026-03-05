import { Injectable, VERSION } from '@angular/core';
import { ToastrService, ToastrConfig } from 'ngx-toastr';

@Injectable()
export class MyToastService {
  options: ToastrConfig;
  title = '';
  type = 1;
  message = '';
  version = VERSION;
  private lastInserted: number[] = [];

  constructor(public toastrService: ToastrService) {
    this.options = this.toastrService.toastrConfig;
  }

  openToast(message, title, type = 'success', postion= 1) {
    if (postion === 1) {
      this.options.positionClass = 'toast-top-right';
    } else if (postion === 2) {
      this.options.positionClass = 'toast-top-center';
    } else if (postion === 1) {
      this.options.positionClass = 'toast-top-right';
    }

    if (type === 'success') {
      this.toastrService.success(message, title, this.options);
    } else if (type === 'error') {
      this.toastrService.error(message, title, this.options);
    } else if (type === 'warning') {
      this.toastrService.warning(message, title, this.options);
    } else if (type === 'info') {
      this.toastrService.info(message, title, this.options);
    }
  }

  public Sucess(message, title, postion= 1) {
    this.openToast(message, title, 'success', postion);
  }
  public Error(message, title, postion= 1) {
    this.openToast(message, title, 'error', postion);
  }

  public Info(message, title, postion= 1) {
    this.openToast(message, title, 'info', postion);
  }

  public Warning(message, title, postion= 1) {
    this.openToast(message, title, 'warning', postion);
  }

  public clearToasts() {
    this.toastrService.clear();
  }
  public clearLastToast() {
    this.toastrService.clear(this.lastInserted.pop());
  }
}
