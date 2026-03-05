import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
export enum CardStyle {
  GradientKingYna = 'gradient-king-yna',
  GradientMint = 'gradient-mint',
  GradientPurpleLove = 'gradient-purple-love',
  GradientIbizaSunset = 'gradient-ibiza-sunset',
}
export interface CardData {
  Caption?: string;
  Value?: any;
  Style?: CardStyle; // Using an object to hold CSS styles
}

@Component({
  selector: 'ft-gradient-card',
  templateUrl: './gradient-card.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class GradientCardComponent implements OnInit {
  @Input() Caption = 'xx';
  @Input() Value = '';
  @Input() Style = CardStyle.GradientIbizaSunset;
  @Input() Size : 'Medium' | 'Large' | 'Small' = 'Medium'
  constructor() {}

  ngOnInit() {
    console.log(this.Style);
  }
}
