import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterReq } from '../../models/registerReq.model';
import { SharedModule } from '../../shared.module';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token?:string;
  constructor(private http:HttpClient) { }

  login(username: string, password:string)
  {
    return this.http.post<any>('/api/acc/auth/login', {username:username, password:password});
  }

  register(req:RegisterReq)
  {
    return this.http.post<any>('/api/acc/auth/register', req);
  }

  saveToken(token:string)
  {
    this.token = token;
  }

  public getUsername() : string | null{
    if (this.token) {
      try {
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        var obj = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        return obj
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private tokenExpired(token: string | null) {
    if(token===null)
    {
      return false;
    }
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  isAuthenticated()
  {
    if(this.token && this.getUsername() && !this.tokenExpired(this.token))
    {
      return true;
    }
    return false;
  }

  getToken()
  {
    return this.token;
  }


  logout()
  {
    this.token=undefined;
  }

}
