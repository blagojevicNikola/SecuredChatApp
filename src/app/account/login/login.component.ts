import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.models';
import { ChatStateService } from 'src/app/chat/services/chat-state.service';
import {ec} from 'elliptic';
import { AppConfigService } from 'src/app/shared/services/config/app-config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  hide:boolean = false;

  username?:string;
  password?:string;

  constructor(private router:Router, private authService:AuthService, private chatStateService:ChatStateService){}

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
            var EC = ec;
            var gen = new EC('secp256k1');
            const keyPair = gen.genKeyPair();
            const privateKey = keyPair.getPrivate('hex');
            const publicKey = keyPair.getPublic('hex');
            let user : User;
            user = {username:value.username, publicRsa:value.publicRsa, privateRsa:value.privateRsa
            ,privateEC: privateKey, publicEC: publicKey };
            this.chatStateService.user = user;
          },
          error:()=>{
            console.log('Error while logging in!');
          }
        }
      )
    }
  }
}
