import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTabSelect]'
})
export class TabSelectDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const ngSelect = this.el.nativeElement as any;

    if (event.key === 'Tab') {
      // Prevent the default tab behavior
      event.preventDefault();

      if (ngSelect.isOpen()) {
        const focusedOption = ngSelect.dropdownPanel.nativeElement.querySelector('.ng-option-selected');
        if (focusedOption) {
          ngSelect.writeValue(focusedOption.textContent);
          ngSelect.close();
        }
      } else {
        ngSelect.open();
      }
    }
  }
}
