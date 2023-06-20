import { Injectable } from '@angular/core';
import { ChatUser } from 'src/app/shared/models/chat-user.models';
import { User } from 'src/app/shared/models/user.models';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {

  user?:User;
  chatUsers:ChatUser[] = []

  constructor() { }
}
