import { Injectable } from '@angular/core';
import { ChatModule } from '../chat.module';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject, share } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { ChatStateService } from './chat-state.service';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import * as NodeF from 'node-forge';
import {ec} from 'elliptic';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  constructor(private chatStateService:ChatStateService) {
    var EC = ec;
    this.gen = new EC('secp256k1');
   }
  gen:ec;
  hubConnection!: signalR.HubConnection

  ssSubj = new Subject<any>;
  ssObs(): Observable<any> {
    return this.ssSubj.asObservable();
  }

  startConnection = () =>{
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('https://localhost:7272/chathub'
    ,{
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    }).build(); 
    this.hubConnection.start().then(()=>{
      console.log('connection started!')
      this.ssSubj.next("Successful");
    })   
    .catch(err => console.log("Error while connecting:"+err));

    if (this.hubConnection.state == HubConnectionState.Connected) {
      this.hubConnection.invoke("join", this.chatStateService.user!.username);
      this.onlineListener();
      this.joinedListener();
      this.newUserListener();
      this.receiveDHListener();
      
    }
    else {
      this.ssObs().subscribe(value => {
        if (value == "Successful") {
          console.log('After connection!');
          this.hubConnection.invoke("join", this.chatStateService.user!.username);
          this.onlineListener();
          this.joinedListener();
          this.newUserListener();
          this.receiveDHListener();
        }
      })
    }
  }

  private joinedListener()
  {
    this.hubConnection.on('Joined', ()=>{
      this.hubConnection.invoke("getOnline");
    })
  }

  
  private onlineListener() {
    this.hubConnection.on("Online", (users: ChatUser[]) => {
      console.log('got online');
      users.forEach(u => u.msgs=[]);
      this.chatStateService.chatUsers = [...users];
    })
  }

  private newUserListener()
  {
    this.hubConnection.on("NewUser", (user:ChatUser)=> {
      user.msgs = [];
      this.chatStateService.chatUsers.push(user);
    })
  }

  exchangeDH(user: ChatUser)
  {
    // const rsaPub = NodeF.pki.publicKeyFromPem(recRsaPub);
    // console.log(this.chatStateService.user!.publicEC);
    // const enc = rsaPub.encrypt(this.chatStateService.user!.publicEC);
    if(user.symmetric)
    {
      return;
    }
    this.hubConnection.invoke("SendPubDH", {receiver:user.username, content:this.chatStateService.user!.publicEC, return: true});
  }

  private receiveDHListener()
  {
    this.hubConnection.on("ReceivePubDH", (message:{sender:string, content:string, return:boolean})=>{
      var index = this.chatStateService.chatUsers.findIndex(u => u.username===message.sender);
      if(index != -1)
      { 
        console.log('received DH from' + message.sender);
        // const receiverPublicKeyHex = Buffer.from(message.content, 'hex');
        const receiverPublicKey = this.gen.keyFromPublic(message.content, 'hex');
        const senderPrivateKey = this.gen.keyFromPrivate(this.chatStateService.user!.privateEC, 'hex');
        const sharedSecret = senderPrivateKey.derive(receiverPublicKey.getPublic());
        this.chatStateService.chatUsers[index].symmetric = sharedSecret.toString('hex');
        console.log('Symmetric is:' + message.return);
        if(message.return === true)
        {
          console.log('I sent it again');
          // const rsaPub = NodeF.pki.publicKeyFromPem(this.chatStateService.chatUsers[index].publicRsa);
          // const enc = rsaPub.encrypt(this.chatStateService.user!.publicEC);
          this.hubConnection.invoke("SendPubDH", {receiver:this.chatStateService.chatUsers[index].username, content:this.chatStateService.user!.publicEC, return: false});
        }
      }
    });
  }

  stopConnection = () =>{
    this.hubConnection.stop();
  }
}
