import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CachedDataService } from '../../../../services/cacheddata.service';
import { HttpBase } from '../../../../services/httpbase.service';
import { MyToastService } from '../../../../services/toaster.server';
@Component({
  selector: 'app-gatepass-delivery',
  templateUrl: './gatepass-delivery.component.html',
  styleUrls: ['./gatepass-delivery.component.scss'],
})
export class GatepassDeliveryComponent implements OnInit, OnChanges {
  @ViewChild('RptTable') RptTable;
  @Input() GatePass: any = {};
  Stores = this.cachedData.Stores$;
public GatePassItems:any = [];

  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private myToast: MyToastService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit() {
    console.log(this.GatePass);
 this.LoadData();
  }
LoadData(){
  this.http.getData(`gatepassitems/${this.GatePass.InvoiceID}/${this.GatePass.GPNo}/${this.GatePass.StoreID}`)
      .then((r:any)=>{
        this.GatePassItems = r
    })
}
  ngOnChanges(e){
    this.LoadData();
    console.log(this.GatePass);

  }
  DelChange(e,idx){
    console.log(e.target.value, idx);
    if (e.target.value> this.GatePassItems[idx].Qty){
      e.target.value =this.GatePassItems[idx].Qty
      this.GatePassItems[idx].Delivered = this.GatePassItems[idx].Qty
      this.myToast.Error('Invalid Quantity', 'Error');
    }
  }
  SaveData(){

    this.http.postTask('savedelivery', this.GatePassItems).then(r=>{
      this.bsModalRef.hide();
      this.myToast.Sucess('Saved successfully', 'Save');
    }).catch(er=>{
      console.log(er);

      this.myToast.Error(er.error.msg, 'Error');
    })

  }
}
