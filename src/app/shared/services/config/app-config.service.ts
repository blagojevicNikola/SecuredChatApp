import { Injectable } from '@angular/core';
import { AppConfig } from '../../models/app-config.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  data:AppConfig = {servers:[]}

  constructor(private http:HttpClient) { }

  load(defaults?:AppConfig):Promise<AppConfig>{
    return new Promise<AppConfig>(resolve =>{
      this.http.get('app.config.json').subscribe(
        response => {
          console.log('Using external server-side config');
          this.data = Object.assign({}, defaults, response);
          resolve(this.data);
        },
        (error)=>{
          console.log('Using default config');
          this.data = Object.assign({}, defaults);
          resolve(this.data);
        }
      )
    });
  }
}
