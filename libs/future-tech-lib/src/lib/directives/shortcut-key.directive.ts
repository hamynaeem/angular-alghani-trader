import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[ftShortcutKey]'
})
export class ShortcutKeyDirective implements OnInit, OnDestroy {
  /** e.g. "F1", "F2", "Shift+F2", "Ctrl+F3", "Alt+Shift+F4" */
  @Input('ftShortcutKey') key = '';

  /** Allow shortcut while typing in inputs/textarea/select/contentEditable */
  @Input() shortcutWhenTyping = false;

  /** Prevent browser default (e.g., F1 help) */
  @Input() preventDefault = true;

  private unlisten?: () => void;

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // listen on window keydown (capture-ish by default in browser)
    this.zone.runOutsideAngular(() => {
      this.unlisten = this.renderer.listen('window', 'keydown', (e: KeyboardEvent) => {
        if (!this.key) return;

        // Skip when user is typing, unless explicitly allowed
        const target = e.target as HTMLElement | null;
        const isTyping =
          !!target &&
          (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);

        if (isTyping && !this.shortcutWhenTyping) return;

        if (this.matches(e, this.key)) {
          if (this.preventDefault) e.preventDefault();
          // Trigger host element click within Angular zone
          this.zone.run(() => this.el.nativeElement.click());
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = undefined;
    }
  }

  private matches(e: KeyboardEvent, combo: string): boolean {
    // Supports F1..F12 with optional modifiers: Ctrl/Alt/Shift/Meta(Cmd)
    const parts = combo.toUpperCase().split('+').map(s => s.trim()).filter(Boolean);

    const wantShift = parts.includes('SHIFT');
    const wantCtrl  = parts.includes('CTRL') || parts.includes('CONTROL');
    const wantAlt   = parts.includes('ALT');
    const wantMeta  = parts.includes('META') || parts.includes('CMD') || parts.includes('COMMAND');

    const fnKey = parts.find(p => /^F\d{1,2}$/.test(p));
    if (!fnKey) return false;

    const keyOk =
      (e.key && e.key.toUpperCase() === fnKey) ||
      // Fallback for older browsers/environments
      (('F' + e.keyCode) === fnKey);

    return (
      keyOk &&
      e.shiftKey === wantShift &&
      e.ctrlKey === wantCtrl &&
      e.altKey === wantAlt &&
      e.metaKey === wantMeta
    );
  }
}
