import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  hidePass:boolean = false;
  hideConfPass:boolean = false;

  constructor(private router:Router){}

  loginNav()
  {
    this.router.navigateByUrl('account/login');
  }
}
