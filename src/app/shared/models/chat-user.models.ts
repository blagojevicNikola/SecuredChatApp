import { Message } from "./message.models";

export interface ChatUser{
    id:number;
    username:string;
    email:string;
    msgs:Message[]
}