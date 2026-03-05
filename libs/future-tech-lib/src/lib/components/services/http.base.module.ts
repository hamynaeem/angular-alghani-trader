import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpBaseConfig } from './httpbase.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
})
export class HttpBaseModule {
    constructor(@Optional() @SkipSelf() parentModule?: HttpBaseModule) {
        if (parentModule) {
            throw new Error(
                'GreetingModule is already loaded. Import it in the AppModule only');
        }
    }

    static forRoot(config: HttpBaseConfig): ModuleWithProviders<HttpBaseModule> {
        return {
            ngModule: HttpBaseModule,
            providers: [
                { provide: HttpBaseConfig, useValue: config }
            ]
        };
    }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
