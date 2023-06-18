import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  hide:boolean = false;

  username?:string;
  password?:string;

  constructor(private router:Router, private authService:AuthService){}

  registerNav()
  {
    this.router.navigateByUrl('account/register');
  }

  login()
  {
    if(this.username && this.password)
    {
      this.authService.login(this.username,this.password).subscribe(
        {
          next:(value)=>{
            this.authService.saveToken(value.token);
            this.router.navigateByUrl('');
          },
          error:()=>{
            console.log('Error while logging in!');
          }
        }
      )
    }
  }
}
