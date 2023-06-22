import { Injectable } from '@angular/core';
import { ChatModule } from '../chat.module';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject, map, share } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { ChatStateService } from './chat-state.service';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import * as NodeF from 'node-forge';
import { ec } from 'elliptic';
import * as CryptoJS from 'crypto-js'
import { SegmentResp } from 'src/app/shared/models/segment-resp.model';
import { encode, decode } from 'ts-steganography';
import { AppConfigService } from 'src/app/shared/services/config/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  constructor(private chatStateService: ChatStateService, private appConfigService: AppConfigService) {
    var EC = ec;
    this.gen = new EC('secp256k1');
    this.hostIndex = Math.floor(Math.random() * this.appConfigService.data.servers.length);
    console.log('Index of host is: ' + this.hostIndex);
    for (let i = 0; i < this.appConfigService.data.servers.length; i++) {
      let tmp = new signalR.HubConnectionBuilder().withUrl(this.appConfigService.data.servers[i]
        , {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        }).build();
      this.hubConnections.push(tmp);
    }
  }

  hubConnections: signalR.HubConnection[] = []
  hostHub!: signalR.HubConnection
  hostIndex!: number;
  gen: ec;
  hubConnection!: signalR.HubConnection
  pending: Map<string, SegmentResp[]> = new Map();

  ssSubj = new Subject<number>;
  ssObs(): Observable<number> {
    return this.ssSubj.asObservable();
  }

  startConnection = () => {
    var br = 1;
    for(let hub of this.hubConnections)
    {
      hub.start().then(() => {
        console.log('connection started!')
        this.ssSubj.next(br++);
      }).catch(err => console.log("Error while connecting:" + err));
    }

    if (this.hubConnections.every(hub => hub.state == HubConnectionState.Connected)) {
      console.log('First check');
      this.connectInternal();
    }
    else {
      this.ssObs().subscribe(value => {
        if(value==2)
        {
          console.log('Second check');
          this.connectInternal();
        }
      })
    }
  }

  private connectInternal()
  {
    for(let hub of this.hubConnections)
      {
        if(hub == this.hubConnections[this.hostIndex])
        {
          hub.invoke("join", this.chatStateService.user!.username);
        }else
        {
          hub.invoke("SilentJoin", this.chatStateService.user!.username);
        }
      }
      this.onlineListener();
      this.joinedListener();
      this.newUserListener();
      this.receiveDHListener();
      this.segmentListener();
      this.offlineListener();
  }

  private joinedListener() {
    this.hubConnections[this.hostIndex].on('Joined', () => {
      this.hubConnections[this.hostIndex].invoke("getOnline");
    })
  }


  private onlineListener() {
    this.hubConnections[this.hostIndex].on("Online", (users: ChatUser[]) => {
      console.log('got online');
      users.forEach(u => u.msgs = []);
      this.chatStateService.chatUsers = [...users];
    })
  }

  private offlineListener()
  {
    for(let hub of this.hubConnections)
    {
      hub.on("Left", (username:string)=>{
        const index = this.chatStateService.chatUsers.findIndex(u => u.username === username);
        if(index!==-1)
        {
          var user = this.chatStateService.chatUsers.splice(index, 1);
          if(this.chatStateService.selectedUser == user[0])
          {
            this.chatStateService.selectedUser = undefined;
          }
        }
      })
    }
  }

  private newUserListener() {
    for(let hub of this.hubConnections)
    {
        hub.on("NewUser", (user: ChatUser) => {
        user.msgs = [];
        this.chatStateService.chatUsers.push(user);
      })
    }
  }

  exchangeDH(user: ChatUser) {
    // const rsaPub = NodeF.pki.publicKeyFromPem(recRsaPub);
    // console.log(this.chatStateService.user!.publicEC);
    // const enc = rsaPub.encrypt(this.chatStateService.user!.publicEC);
    if (user.symmetric) {
      return;
    }
    this.hubConnections[this.hostIndex].invoke("SendPubDH", { receiver: user.username, content: this.chatStateService.user!.publicEC, return: true });
  }

  private receiveDHListener() {
    for(let hub of this.hubConnections)
    {
      hub.on("ReceivePubDH", (message: { sender: string, content: string, return: boolean }) => {
        var index = this.chatStateService.chatUsers.findIndex(u => u.username === message.sender);
        if (index != -1) {
          console.log('received DH from' + message.sender);
          // const receiverPublicKeyHex = Buffer.from(message.content, 'hex');
          const receiverPublicKey = this.gen.keyFromPublic(message.content, 'hex');
          const senderPrivateKey = this.gen.keyFromPrivate(this.chatStateService.user!.privateEC, 'hex');
          const sharedSecret = senderPrivateKey.derive(receiverPublicKey.getPublic());
          this.chatStateService.chatUsers[index].symmetric = sharedSecret.toString('hex');
          console.log('Symmetric is:' + message.return);
          if (message.return === true) {
            console.log('I sent it again');
            // const rsaPub = NodeF.pki.publicKeyFromPem(this.chatStateService.chatUsers[index].publicRsa);
            // const enc = rsaPub.encrypt(this.chatStateService.user!.publicEC);
            this.hubConnections[this.hostIndex].invoke("SendPubDH", { receiver: this.chatStateService.chatUsers[index].username, content: this.chatStateService.user!.publicEC, return: false });
          }
        }
      });
    }
  }

  async sendMessage(user: ChatUser, content: string) {
    var data: string[] = [];
    var sliceSize: number = 10;
    for (var i = 0; i < 4; i++) {
      if (i == 3) {
        data.push(content.slice(sliceSize * i));
      } else {
        data.push(content.slice(sliceSize * i, sliceSize * (i + 1)))
      }
    }
    var messageId = Math.floor((Math.random() * 10000) + 1).toString();
    var receiver = user.username;
    for (var i = 0; i < data.length; i++) {
      var steg = false;
      var toSendSegment = data[i];
      if (i == data.length - 1) {
        steg = true;
        const result = await encode(data[i], 'assets/crypt.png');
        toSendSegment = result;
      }
      var toSend: { messageId: string, steg: boolean, max: number, curr: number, segment: string }
        = { messageId: messageId, steg: steg, max: data.length, curr: i, segment: toSendSegment };
      console.log("MessageId:" + messageId + " max:" + data.length + " curr:" + i + " segment:" + data[i]);
      const ecnrypted = CryptoJS.AES.encrypt(JSON.stringify(toSend), user.symmetric!);
      console.log("Encrypted:" + ecnrypted.toString());
      this.hubConnections[i%this.hubConnections.length].invoke("SendMsg", { receiver: receiver, content: ecnrypted.toString() });
    }
    user.msgs.push({ sender: this.chatStateService.user!.username, receiver: receiver, content: content })
  }

  private segmentListener() {
    for(let hub of this.hubConnections)
    {
      hub.on("ReceiveSegment", async (result: { sender: string; segment: string }) => {
        var index = this.chatStateService.chatUsers.findIndex(u => u.username == result.sender);
        if (index != -1 && this.chatStateService.chatUsers[index].symmetric) {
          console.log('Segment received!' + result.sender + '-' + result.segment);
          const key = this.chatStateService.chatUsers[index].symmetric;
          const decrypted = CryptoJS.AES.decrypt(result.segment, key!);
          const jsonValue = decrypted.toString(CryptoJS.enc.Utf8);
          console.log(decrypted.toString());
          var objectValue: SegmentResp = JSON.parse(jsonValue);
          if (objectValue.steg) {
            objectValue.segment = await decode(objectValue.segment);
          }
          var segmentList = this.pending.get(objectValue.messageId);
          if (segmentList == undefined) {
            console.log("Message id didnt exist!");
            this.pending.set(objectValue.messageId, [objectValue]);
          } else {
            segmentList.push(objectValue);
            console.log("Pushed segment into pending");
            if (segmentList.length == objectValue.max) {
              console.log('formed message');
              var content = '';
              segmentList.sort((a, b) => a.curr - b.curr).forEach(s => content += s.segment);
              this.chatStateService.chatUsers[index].msgs.push({ sender: result.sender, receiver: this.chatStateService.user!.username, content: content });
              this.pending.delete(objectValue.messageId);
            }
          }
  
        }
      });
    }
  }

  logout()
  {
    this.hubConnections[this.hostIndex].invoke("LoggingOut").then(()=>{
      this.stopConnection();
    });
  }

  stopConnection = () => {
    for(let hub of this.hubConnections)
    {
      hub.stop();
    }
  }
}
