import { Routes } from '@angular/router';
import { MyToastService } from "./../../../services/toaster.server";
import { HttpBase } from "./../../../services/httpbase.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-salesman-area",
  templateUrl: "./salesman-area.component.html",
  styleUrls: ["./salesman-area.component.scss"],
})
export class SalesmanAreaComponent implements OnInit {
  public Filter = {
    area_id: "",
    employ_id: "",
    business_id: "",
  };
  Areas = [];
  Salesman = [];
  data = [];

  public settings = {
    Columns: [
      {
        label: "Area Name",
        fldName: "area_name",
      },
    ],
    Actions: [
      {
        action: "delete",
        title: "Delete",
        icon: "trash",
        class: "danger",
      },
    ],
    Data: [],
  };

  public Business = [];
  public bid = '';
  constructor(private toaster: MyToastService, private http: HttpBase) {}

  ngOnInit() {
    this.http.getData('business').then((r:any)=>{
      this.Business = r;
      this.Business.push();
      this.Filter.business_id = this.http.getBusinessID();
      this.bid = this.Filter.business_id;

      this.LoadSM(this.bid);

    })
  }

  LoadSM(bid){
  this.http.getData('employs?filter=business_id=' + bid).then((r:any)=>{
    this.Salesman = r;
  })
  this.http.getRoutes(bid).then((r:any)=>{
    this.Areas = r;
  })
}

  AddArea() {
    let r;
    r = this.data.find((x) => {
      return x.area_id == this.Filter.area_id;
    });
    if (r) {
      this.toaster.Error("Area already exists", "Error");
      return;
    }

    this.http
      .postData("smareas", this.Filter)
      .then((r) => {
        this.FilterData(this.Filter.employ_id);
        this.Filter.area_id = "";
      })
      .catch((r) => {
        this.toaster.Error(r.message, "Add");
      });
  }
  Clicked($v) {
    console.log($v);
    if ($v.action == "delete") {
      this.http.Delete("smareas", $v.data.id).then((r) => {
        this.toaster.Sucess("Area removed from salesman", "Delete");
        this.data = this.data.filter(x=>x.id != $v.data.id )
      });
    }
  }
  SalesmanClicked(e) {
    if (e.itemData && e.itemData.id !== "") {
      this.FilterData(e.itemData.id);
    }
  }
  BusinessClicked(e) {
    if (e.itemData && e.itemData.business_id !== "") {
      this.LoadSM(e.itemData.business_id);
    }
  }
  FilterData(id) {
    this.http.getData("getsmarea/" + id).then((d: any) => {
      this.data = d;
    });
  }
}
