import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, empty } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenStorageService } from 'src/app/services/token-storage.service'
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

//API Endpoint: https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/auth
const AUTH_API = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/auth';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(
    private http: HttpClient, 
    private tokenStorageService:TokenStorageService, 
    private _router: Router) { }
    
    public jwtHelper: JwtHelperService = new JwtHelperService();

    login(username: string, password: string): Observable<any> {
        if (username === 'dummyUser' && password === 'Test@123') {
            return this.http.post(AUTH_API, {
                username,
                password
            }, httpOptions);
        }
        else {
            return throwError({ error: 'invalid user' })
        }

    }

  public isAuthenticated(): boolean {
    const token = this.tokenStorageService.getToken();

    if (this.jwtHelper.isTokenExpired(token!)) {
        this.tokenStorageService.signOut();
        this._router.navigateByUrl("/login");
    }
    else {
        return true;
    }

    return false;
}
}
