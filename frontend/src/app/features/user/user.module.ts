import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ViewProfileComponent } from './components/view-profile/view-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { ChangePasswordRequestComponent } from './components/change-password-request.component';

const routes: Routes = [
  {
    path: '',
    redirectTo:'profile',
    pathMatch: 'full'

  },
  {
    path: 'profile',
    component: ViewProfileComponent
  },
  {
    path: 'change-password-request',
    component: ChangePasswordRequestComponent
  },
  {
    path: 'change-password/:token',
    component: ChangePasswordComponent
  }

];

@NgModule({
  declarations: [
    ChangePasswordComponent,
    ViewProfileComponent,
    ChangePasswordRequestComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [RouterModule],
})
export class UserModule { }
