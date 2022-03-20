import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isAuthenticated = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private _router: Router) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isAuthenticated = true;
    }
  }

  onSubmit(): void {
    let username = this.form.value.username;
    let password = this.form.value.password;

    this.authService.login(username, password).subscribe({
      next: data => {
        if (data.success) {
          console.log(data)
          this.tokenStorage.saveToken(data.token);
          this.isLoginFailed = false;
          this.isAuthenticated = true;
          this._router.navigate(['/']).then(() => {
            this.reloadPage();
          });
        }
      },
      error: err => {
        if (err.error === 'invalid user') {
          this.errorMessage = "The username and password were not recognized";
        }
        else {
          this.errorMessage = err.error.message;
        }
        this.isLoginFailed = true;
      }
    });
  }
  reloadPage(): void {
    window.location.reload();
  }


}