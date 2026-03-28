import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
})
export class AuthCallbackComponent {
  constructor(private auth: AuthService, private router: Router) {
    this.handleCallback();
  }

  private handleCallback(): void {
    console.log('[callback] trying handleRedirectCallback', window.location.href);
    this.auth.idTokenClaims$.subscribe(claims => {
      console.log('CLAIMS COMPLETOS:', claims);
    });
    this.auth.handleRedirectCallback().subscribe({
      next: (result) => {
        console.log('[callback] successful', result);
        // always clear query params then go /movies
        this.router.navigate(['/movies'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('[callback] error', err);
        this.router.navigate(['/'], { replaceUrl: true });
      },
    });
  }
}
