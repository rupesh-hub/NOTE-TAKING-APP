// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./core/core.module').then((m) => m.CoreModule),
    canActivate: [authenticationGuard]
  },
  {
    path: 'home',
    canActivate: [authenticationGuard],
    loadChildren: () => import('./features/feature.module').then((m) => m.FeatureModule)
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}