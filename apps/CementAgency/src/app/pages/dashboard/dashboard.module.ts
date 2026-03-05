import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { DashboardComponent } from "./dashboard.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { FormsModule } from '@angular/forms';

export const routes:any = [
  { path: "", component: DashboardComponent, pathMatch: "full" },

];
// ---
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule,
    NgxChartsModule,
    FormsModule
  ],
  declarations: [
    DashboardComponent,
  ],
})
export class DashboardModule {}
