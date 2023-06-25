import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {path:'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule)},
  {path:'', loadChildren:()=> import('./chat/chat.module').then(m => m.ChatModule), canActivate:[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
