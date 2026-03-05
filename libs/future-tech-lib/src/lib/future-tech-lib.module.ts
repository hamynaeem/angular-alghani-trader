import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  CommandColumnService,
  EditService,
  GridModule,
} from '@syncfusion/ej2-angular-grids';
import { DataTablesModule } from 'angular-datatables';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { QuillModule } from 'ngx-quill';
import { AutoFocusDirective } from './components/autofocus/auofocus.directive';
import { ButtonsBarComponent } from './components/buttons-bar/buttons-bar.component';
import { CrudFormComponent } from './components/crud-form/crud-form.component';
import { CrudListComponent } from './components/crud-list/crud-list.component';
import { CrudComponent } from './components/crud/crud.component';
import { FtDataGridComponent } from './components/data-grid/data-grid.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { FormlyFormComponent } from './components/formly-form/formly-form.component';
import { FtDataTableComponent } from './components/ft-data-table/ft-data-table.component';
import { GradientCardComponent } from './components/gradient-card/gradient-card.component';
import { InputControlComponent } from './components/input-control/input-control.component';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';
import { MultiColComboboxNgComponent } from './components/multi-col-combobox-ngselect/multi-col-combobox-ng.component';
import { MultiColComboboxComponent } from './components/multi-col-combobox/multi-col-combobox.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { NgxDatatableComponent } from './components/ngx-datatable/ngx-datatable.component';
import { SearchControlComponent } from './components/search-control/search-control.component';
import { SearchGridComponent } from './components/search-grid/search-grid.component';
import { SearchComponent } from './components/search/search.component';
import { HttpBase } from './components/services/httpbase.service';
import { ModalService } from './components/services/modal.service';
import { MyToastService } from './components/services/toaster.server';
import { StoresComponent } from './components/stores/stores.component';
import { TableWithGroupComponent } from './components/table-with-group/table-with-group.component';
import { ShortcutKeyDirective } from './directives/shortcut-key.directive';
import { FutureTechLibComponent } from './future-tech-lib.component';
import { DateAsAgoPipe } from './pipes/date-ago.pipe';
import { ShortNamePipe } from './pipes/short-name.pipe';
import { FilterPipe } from './pipes/table-filter.pipe';
import { FTModalService } from './services/modal.service';

@NgModule({
  declarations: [
    FutureTechLibComponent,
    CrudComponent,
    CrudListComponent,
    MultiColComboboxComponent,
    CrudFormComponent,
    CrudComponent,
    FtDataTableComponent,
    ModalContainerComponent,
    DynamicTableComponent,
    FilterPipe,
    FormlyFormComponent,
    NgxDatatableComponent,
    ShortNamePipe,
    SearchGridComponent,
    AutoFocusDirective,
    TableWithGroupComponent,
    SearchComponent,
    MultiColComboboxNgComponent,
    NavigatorComponent,
    StoresComponent,
    ButtonsBarComponent,
    GradientCardComponent,
    DateAsAgoPipe,
    FtDataGridComponent,
    SearchControlComponent,
    InputControlComponent,
    ShortcutKeyDirective
  ],
  imports: [
    CommonModule,
    ComboBoxModule,
    DataTablesModule,
    NgbModule,
    ReactiveFormsModule,
    GridModule,
    FormsModule,
    NgSelectModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    FormlyBootstrapModule,
    FormlyModule.forRoot(),
    QuillModule.forRoot(),
    NgxDropzoneModule,
  ],
  exports: [
    FutureTechLibComponent,
    CrudListComponent,
    CrudComponent,
    MultiColComboboxComponent,
    CrudFormComponent,
    FtDataTableComponent,
    ModalContainerComponent,
    DynamicTableComponent,
    NgxDatatableComponent,
    ShortNamePipe,
    FilterPipe,
    FormlyFormComponent,
    SearchGridComponent,
    AutoFocusDirective,
    TableWithGroupComponent,
    SearchComponent,
    MultiColComboboxNgComponent,
    NavigatorComponent,
    StoresComponent,
    ButtonsBarComponent,
    GradientCardComponent,
    DateAsAgoPipe,
    FtDataGridComponent,
    SearchControlComponent,
    InputControlComponent,
    ShortcutKeyDirective
  ],
  providers: [
    MyToastService,
    ModalService,
    HttpBase,
    FTModalService,
    EditService,
    CommandColumnService,
  ],
})
export class FutureTechLibModule {}
