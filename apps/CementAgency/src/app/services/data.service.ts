import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class DataService {

  private customers  = new Subject<void>();

}
