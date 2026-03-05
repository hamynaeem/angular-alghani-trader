import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.css']
})
export class OtpInputComponent {
  otp: string[] = ['', '', '', ''];
  @Output() otpComplete = new EventEmitter<string>();

  onInput(event: any, index: number) {
    const input = event.target.value;
    if (input.length === 1) {
      this.otp[index] = input;
      if (index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    } else if (input.length === 0 && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    this.checkOtpComplete();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && this.otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  checkOtpComplete() {
    if (this.otp.every(digit => digit !== '')) {
      this.otpComplete.emit(this.otp.join(''));
    }
  }
  GetOtp(){
    return this.otp.join('');
  }
}
