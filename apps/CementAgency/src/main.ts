import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { registerLicense } from '@syncfusion/ej2-base';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Registering Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NHaF5cWWdCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWX5fdHZUQ2heUkJ3WUA=');

if (environment.production) {
  enableProdMode();
}

// Suppress noisy browser "AbortError: The play() request was interrupted by a call to pause()" logs
// which originate from interrupted media/animation play() promises. This prevents an unhandled
// rejection from cluttering the console while the underlying animation/audio timing is harmless.
try {
  window.addEventListener('unhandledrejection', (evt: any) => {
    try {
      const r = evt && evt.reason;
      if (!r) return;
      const msg = String(r.message || r);
      const isAbortPlay = (r.name === 'AbortError') && msg.indexOf('play()') !== -1;
      if (isAbortPlay) {
        evt.preventDefault();
      }
    } catch (e) {
      // ignore handler errors
    }
  });
} catch (e) { /* ignore in non-browser environments */ }

platformBrowserDynamic().bootstrapModule(AppModule);
