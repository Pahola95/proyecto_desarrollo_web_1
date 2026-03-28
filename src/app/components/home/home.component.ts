import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  auth = inject(AuthService);

  login(): void {
    this.auth.loginWithRedirect();
   
  }
  
  roles$ = this.auth.idTokenClaims$.pipe(
  map(claims => claims?.['https://dev-a72raa3k3qfkxx7z.us.auth0.com/roles'] || [])
);

isAdmin$ = this.roles$.pipe(
  map(roles => roles.includes('admin'))
);  

}
