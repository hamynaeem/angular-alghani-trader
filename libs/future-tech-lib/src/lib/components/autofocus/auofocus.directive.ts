import { AfterContentInit, Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[ftAutoFocusDirective]"
})

export class AutoFocusDirective implements AfterContentInit {

  @Input()
  public appAutoFocus: boolean
  constructor(private el: ElementRef){

  }
  ngAfterContentInit(){
    setTimeout(() => {
      this.el.nativeElement.focus();
      this.el.nativeElement.select();

    }, 500);
  }
}
