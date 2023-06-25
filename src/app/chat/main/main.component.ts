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
  
  msgContent:string = '';

  @ViewChild('msgComp') messageContainer!:ElementRef;
  @ViewChild('msgList') messageList?:ElementRef;

  constructor(private signalrService: SignalrService, public authService: AuthService, public chatStateService:ChatStateService) { }
  
  ngOnInit(): void {
    this.signalrService.startConnection();
  }

  ngOnDestroy(): void {
    this.signalrService.logout();
    this.authService.logout();
  }

  openChat(user:ChatUser)
  {
    if(user!=this.chatStateService.selectedUser)
    {
      this.signalrService.exchangeDH(user);
      this.chatStateService.selectedUser = user;
      this.scrollToBottom();
    }
  }

  async sendMessage()
  {
    if(this.chatStateService.selectedUser && this.msgContent!='' && this.chatStateService.selectedUser.symmetric)
    {
      await this.signalrService.sendMessage(this.chatStateService.selectedUser, this.msgContent);
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

  textAreaListener(event:KeyboardEvent)
  {
    if(event.key === 'Enter')
    {
      this.sendMessage();
    }
  }

  getFirstLetter(username:string)
  {
    return username.charAt(0).toUpperCase();
  }

}
