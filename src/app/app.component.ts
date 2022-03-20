import { Component } from '@angular/core';
import { TokenStorageService } from './services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rsiscuba';
  isAuthenticated = false;
  router: string;

  constructor(private tokenStorageService: TokenStorageService, private _router: Router) {
    this.router = _router.url;
    console.log(this.router)
  }

  ngOnInit(): void {
    this.isAuthenticated = !!this.tokenStorageService.getToken();
  }

  logout() {
    this.tokenStorageService.signOut();
    this._router.navigate(['/login']).then(() => {
      window.location.reload();
    })
  }

  login() {
    this.tokenStorageService.signOut();
    this.redirectTo('/login')
  }

  redirectTo(uri: string) {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this._router.navigate([uri]));
  }
}

