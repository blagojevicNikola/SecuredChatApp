import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from '../services/signalr.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  onlineUsers: ChatUser[] = [{id:1, username:'nikola', email:'test'},
  {id:2, username:'test', email:'test'},
  {id:3, username:'proba', email:'test'}]

  selectedUser?:ChatUser;

  constructor(private signalrService: SignalrService, public authService: AuthService) { }
  
  ngOnInit(): void {
    // this.signalrService.startConnection();
    // if (this.signalrService.hubConnection.state == HubConnectionState.Connected) {
    //   this.signalrService.hubConnection.invoke("join", this.authService.getUsername());
    //   this.onlineListener();
    //   this.joinedListener();
    //   this.newUserListener();
    // }
    // else {
    //   this.signalrService.ssObs().subscribe(value => {
    //     if (value == "Successful") {
    //       console.log('After connection!');
    //       this.signalrService.hubConnection.invoke("join", this.authService.getUsername());
    //       this.onlineListener();
    //       this.joinedListener();
    //       this.newUserListener();
    //     }
    //   })
    // }
  }

  ngOnDestroy(): void {
    // this.signalrService.stopConnection();
  }

  openChat(user:ChatUser)
  {
    if(user!=this.selectedUser)
    {
      this.selectedUser = user;
    }
  }

  private joinedListener()
  {
    this.signalrService.hubConnection.on('Joined', ()=>{
      this.signalrService.hubConnection.invoke("getOnline");
    })
  }

  private onlineListener() {
    this.signalrService.hubConnection.on("Online", (users: ChatUser[]) => {
      console.log('got online');
      this.onlineUsers = users;
    })
  }

  private newUserListener() {
    this.signalrService.hubConnection.on("NewUser", (newUser: ChatUser) => {
      console.log('got new user');
      this.onlineUsers.push(newUser);
    })
  }

}
