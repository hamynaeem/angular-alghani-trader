import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum Buttons {
  First= 1,
  Previous= 2,
  Next= 3,
  Last= 4,
}  ;


@Component({
  selector: 'ft-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css'],
})
export class NavigatorComponent {
  @Input() disabled: boolean = false;
  @Output()
  ClickAction: EventEmitter<any> = new EventEmitter<any>();


//  navigatorButtons: ButtonConfig[] = [
//     {
//       title: '',
//       icon: 'fa-backward-fast',
//       classes: 'btn-secondary',
//       action: () =>  this.ButtonClicked(1),
//       size: 'lg',
//     },
//     {
//       title: '',
//       icon: 'fa-fa-backward',
//       classes: 'btn-secondary',
//       action: () =>  this.ButtonClicked(1),
//       size: 'lg',
//     },
//     {
//       title: '',
//       icon: 'fa-fa-backward',
//       classes: 'btn-secondary',
//       action: () =>  this.ButtonClicked(1),
//       size: 'lg',
//     },
//     {
//       title: '',
//       icon: 'fa-fa-backward',
//       classes: 'btn-secondary',
//       action: () =>  this.ButtonClicked(1),
//       size: 'lg',
//     },

//  ]

  constructor() {}
  ButtonClicked(button: Buttons){
    this.ClickAction.emit({ Button:button  });
  }
}
