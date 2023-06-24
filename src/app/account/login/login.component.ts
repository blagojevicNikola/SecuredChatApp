import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.models';
import { ChatStateService } from 'src/app/chat/services/chat-state.service';
import {ec} from 'elliptic';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar'; 
import { AppConfigService } from 'src/app/shared/services/config/app-config.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  hide:boolean = true;
  disabled:boolean = false;
  username?:string;
  password?:string;

  constructor(private router:Router, private authService:AuthService, private chatStateService:ChatStateService, private _snackBar:MatSnackBar){}

  registerNav()
  {
    this.router.navigateByUrl('account/register');
  }

  login()
  {
    if(this.username && this.password)
    {
      this.disabled = true;
      this.authService.login(this.username,this.password).subscribe(
        {
          next:(value)=>{
            this.authService.saveToken(value.token);
            var EC = ec;
            var gen = new EC('secp256k1');
            const keyPair = gen.genKeyPair();
            const privateKey = keyPair.getPrivate('hex');
            const publicKey = keyPair.getPublic('hex');
            let user : User;
            user = {username:value.username, publicRsa:value.publicRsa, privateRsa:value.privateRsa
            ,privateEC: privateKey, publicEC: publicKey };
            this.chatStateService.user = user;
            this.router.navigateByUrl('');
            this.disabled=false;
          },
          error:(err:HttpErrorResponse)=>{
            if(err.status==404)
            {
              this._snackBar.open("Incorrect username or password!", "Okay", {duration:3000});
            }
            else
            {
              this._snackBar.open("Error while connecting!", "Okay", {duration:3000});
            }
            this.disabled = false;
          }
        }
      )
    }
  }
}
