import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatCardModule} from '@angular/material/card'; 
import {MatListModule} from '@angular/material/list'; 
import {MatInputModule} from '@angular/material/input'; 
import {MatIconModule} from '@angular/material/icon'; 
import { ChatRoutingModule } from './chat-routing.module';
import { MainComponent } from './main/main.component';
import { FormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 

@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    MatProgressSpinnerModule
  ]
})
export class ChatModule { }
