import { Component, OnInit } from '@angular/core';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { Router } from '@angular/router';
import swal from 'sweetalert';

@Component({
  selector: 'app-close-account',
  templateUrl: './close-account.component.html',
  styleUrls: ['./close-account.component.scss']
})
export class CloseAccountComponent implements OnInit {

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    SalesmanID: '',
    CustomerID: ''
  };
  constructor(
    private http: HttpBase,
    private router: Router
  ) { }

  ngOnInit() {


  }

  CloseAccounts() {
    swal({
      text: 'Account will be closed, Continue ??',
      icon: 'warning',
      buttons: {
        cancel: true,
        confirm: true,
      },
    })
      .then(close => {
        if (close) {
          this.http.postTask('CloseAccount/' + this.http.getBusinessID(), { ClosingID: this.http.getClosingID() }).then(r => {
            swal('Close Account!', 'Account was successfully closed, Login to next date', 'success');
            this.router.navigateByUrl('/login');
          }).catch(er => {
            swal('Oops!', 'Error while deleting voucher', 'error');
          });
        }
      });
  }

}
