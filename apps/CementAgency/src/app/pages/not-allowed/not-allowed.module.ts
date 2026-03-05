import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NotAllowedComponent } from "./not-allowed.component";



export const routes:any = [
  { path: "", component: NotAllowedComponent, pathMatch: "full" },

];
// ---
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule,
    NgxChartsModule,

  ],
  declarations: [
    NotAllowedComponent,
  ],
})
export class NotAllowedModule {}
