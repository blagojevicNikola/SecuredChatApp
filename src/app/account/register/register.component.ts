import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import {encode, decode} from 'ts-steganography'
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  hidePass:boolean = true;
  hideConfPass:boolean = true;
  username:string = '';
  email:string= '';
  password:string='';
  confirmPassword:string = '';
  disabled:boolean = false;

  constructor(private router:Router, private authService:AuthService, private _snackBar:MatSnackBar){}

  register()
  {
    if(this.username!='' && this.email!='' && this.password!='' && this.password===this.confirmPassword)
    {
      this.authService.register({username:this.username, password:this.password, email:this.email})
      .subscribe({
        next:(response)=>{
          this._snackBar.open("Registration successful. Login to continue...", "Okay", {duration:3000});
          this.router.navigateByUrl('account/login');
          this.disabled = false;
        },
        error:(err:HttpErrorResponse) =>{
          if(err.status === 409)
          {
            this._snackBar.open("Username or email is already used!", "Okay", {duration:3000});
          }
          else
          {
            this._snackBar.open("Error while connecting!", "Okay", {duration:3000});
          }
          this.disabled = false;
        }
      })
    }
  }

  loginNav()
  {
    this.router.navigateByUrl('account/login');
  }
}
