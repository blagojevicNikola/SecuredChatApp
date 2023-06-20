import { Message } from "./message.models";

export interface ChatUser{
    id:number;
    username:string;
    msgs:Message[];
    publicRsa:string;
    symmetric?:string;
    online:boolean;
}