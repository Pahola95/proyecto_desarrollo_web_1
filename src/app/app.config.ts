import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAuth0({
      domain: "dev-ffrdftbvnd5verpy.us.auth0.com",
      clientId: "rNLZmLJHzlrIIviA3joNraZRlI9Nk3qN",
      authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    }),
  ],
};
