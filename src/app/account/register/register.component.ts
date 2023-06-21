import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {encode, decode} from 'ts-steganography'
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  hidePass:boolean = false;
  hideConfPass:boolean = false;

  constructor(private router:Router){}

  register()
  {
    encode("Ovo je probna porukica!", 'assets/crypt.jpg').then((result)=>{
      decode(result).then((rr)=> {console.log(rr)})
    })
  }

  loginNav()
  {
    this.router.navigateByUrl('account/login');
  }
}
