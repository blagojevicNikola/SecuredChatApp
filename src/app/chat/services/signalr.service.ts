import { Injectable } from '@angular/core';
import { ChatModule } from '../chat.module';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  constructor() { }

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
  }

  stopConnection = () =>{
    this.hubConnection.stop();
  }
}
