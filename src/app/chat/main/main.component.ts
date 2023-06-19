import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SignalrService } from '../services/signalr.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import { HubConnectionState } from '@microsoft/signalr';
import { FormControl, FormGroup } from '@angular/forms';
import { Message } from 'src/app/shared/models/message.models';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  onlineUsers: ChatUser[] = []
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


  constructor(private signalrService: SignalrService, public authService: AuthService) { }
  
  ngOnInit(): void {
    this.signalrService.startConnection();
    if (this.signalrService.hubConnection.state == HubConnectionState.Connected) {
      this.signalrService.hubConnection.invoke("join", this.authService.getUsername());
      this.onlineListener();
      this.joinedListener();
      this.newUserListener();
      this.messageListener();
    }
    else {
      this.signalrService.ssObs().subscribe(value => {
        if (value == "Successful") {
          console.log('After connection!');
          this.signalrService.hubConnection.invoke("join", this.authService.getUsername());
          this.onlineListener();
          this.joinedListener();
          this.newUserListener();
          this.messageListener();
        }
      })
    }
  }

  ngOnDestroy(): void {
   this.signalrService.stopConnection();
  }

  openChat(user:ChatUser)
  {
    if(user!=this.selectedUser)
    {
      this.selectedUser = user;
      this.scrollToBottom();
    }
  }


  sendMsg()
  {
    if(this.msgContent === '')
    {
      return;
    }
    let tmp:Message = {sender:this.authService.getUsername()!, receiver:this.selectedUser?.username!, content:this.msgContent}
    this.signalrService.hubConnection.invoke('SendMsg', tmp)
    .then(() => {console.log("added"); this.selectedUser?.msgs.push(tmp); this.scrollToBottom();}).catch((err)=>{
      var index = this.selectedUser?.msgs.findIndex(m => m.content == tmp.content);
      console.log('error');
      if(index!=null)
      {
        this.selectedUser?.msgs.splice(index, 1);
      }
    })
  }

  private joinedListener()
  {
    this.signalrService.hubConnection.on('Joined', ()=>{
      this.signalrService.hubConnection.invoke("getOnline");
    })
  }

  private messageListener()
  {
    this.signalrService.hubConnection.on("MessageSent", (msg:Message) =>{
      var index = this.onlineUsers.findIndex(u => u.username == msg.sender)
      if(index!=null)
      {
        this.onlineUsers[index].msgs.push(msg);
        this.scrollToBottom();
      }
    })
  }

  private onlineListener() {
    this.signalrService.hubConnection.on("Online", (users: ChatUser[]) => {
      console.log('got online');
      users.forEach(u => u.msgs=[]);
      this.onlineUsers = users;
    })
  }

  private scrollToBottom()
  {
    if(this.messageContainer)
    {
      const comp = this.messageContainer.nativeElement;
      const list = this.messageList?.nativeElement;
      comp.scrollTop = list.scrollHeight;
      console.log('scrolled');
    }
  }

  private newUserListener() {
    this.signalrService.hubConnection.on("NewUser", (newUser: ChatUser) => {
      console.log('got new user');
      newUser.msgs=[];
      this.onlineUsers.push(newUser);
    })
  }

}
