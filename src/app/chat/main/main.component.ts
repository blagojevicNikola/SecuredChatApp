import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SignalrService } from '../services/signalr.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import { HubConnectionState } from '@microsoft/signalr';
import { FormControl, FormGroup } from '@angular/forms';
import { ChatStateService } from '../services/chat-state.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  // [{id:1, username:'nikola', email:'test', msgs:[
  //   {sender:'nikola', receiver:'nesto', content:'llasdkjfaslkdfjlsadk jfasldfjasldfjk aslkdfjas ldfkjasdflkj'},
  //   {sender:'nesto', receiver:'nikola', content:'llaadk jfasldfjasldfjk aslkdfjas ldfkjasdflkj'},
  //   {sender:'nikola', receiver:'nesto', content:'llasdkjfaslkdfjlsadk jfasldfjasldfjk aslkdfjas ldfkjas sadf asd asdfdddflkj'},
  // ]},
  // {id:2, username:'test', email:'test', msgs:[]},
  // {id:3, username:'proba', email:'test', msgs:[]}]
  msgContent:string = '';
  selectedUser?:ChatUser;

  @ViewChild('msgComp') messageContainer!:ElementRef;
  @ViewChild('msgList') messageList?:ElementRef;


  constructor(private signalrService: SignalrService, public authService: AuthService, public chatStateService:ChatStateService) { }
  
  ngOnInit(): void {
    this.signalrService.startConnection();
    
  }

  ngOnDestroy(): void {
   this.signalrService.stopConnection();
  }

  openChat(user:ChatUser)
  {
    if(user!=this.selectedUser)
    {
      this.signalrService.exchangeDH(user);
      this.selectedUser = user;
      this.scrollToBottom();
    }
  }

  async sendMessage()
  {
    if(this.selectedUser && this.msgContent!='' && this.selectedUser.symmetric)
    {
      await this.signalrService.sendMessage(this.selectedUser, this.msgContent);
      this.msgContent = '';
    }
  }

  private scrollToBottom()
  {
    if(this.messageContainer && this.messageList)
    {
      const comp = this.messageContainer.nativeElement;
      const list = this.messageList?.nativeElement;
      comp.scrollTop = list.scrollHeight;
      console.log('scrolled');
    }
  }

}
