import { Component, Input } from '@angular/core';

export interface ButtonConfig {
  title: string; // Button text
  icon?: string; // Icon class (optional)
  classes?: string; // Additional Bootstrap classes (optional)
  action: () => void; // Button click handler
  disabled?: boolean;
  shortcut?:string
  type?:string
  size?:string

}

@Component({
  selector: 'ft-buttons-bar',
  templateUrl: './buttons-bar.component.html',
  styleUrls: ['./buttons-bar.component.css'],
})
export class ButtonsBarComponent {
  @Input() buttons: ButtonConfig[] = [];
  @Input() disabled: boolean = false;

  constructor() {}

  DisableBtn(idx: number, status: boolean) {
    if (idx < this.buttons.length) {
      this.buttons = this.buttons.map((button, index) =>
        index === idx
          ? { ...button, disabled: !status }  // Change State
          : button
      );


      this.buttons[idx].disabled = status;
      this.buttons = [...this.buttons];
    }
  }

}
