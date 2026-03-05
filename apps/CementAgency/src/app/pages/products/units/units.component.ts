import { Component, OnInit } from '@angular/core';
import { UnitsForm } from '../../../factories/forms.factory';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {

  constructor() { }
  public form = UnitsForm.form;
  public list = UnitsForm.list;
  ngOnInit() {
  }

}
