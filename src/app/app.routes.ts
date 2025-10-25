import { Routes } from '@angular/router';
import { DashboardUi } from './pages/dashboard-ui/dashboard-ui';
import { ItemUi } from './pages/item-ui/item-ui';
import { ItemEditorUi } from './pages/item-editor-ui/item-editor-ui';
import { UserUi } from './pages/user-ui/user-ui';
import { HttpRespUi } from './pages/http-resp-ui/http-resp-ui';
import { LoginUi } from './pages/login-ui/login-ui';
import { AuthGuard } from './services/auth.guard';
import { LoginGuard } from './services/login.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardUi
  },
  {
    path: 'item/:id',
    component: ItemUi
  },
  {
    path: 'new-item',
    component: ItemEditorUi
  },
  {
    path: 'edit-item/:id',
    component: ItemEditorUi
  },
  {
    path: 'new-record/:itemId',
    component: ItemEditorUi
  },
  {
    path: 'edit-record/:itemId/:recordIndex',
    component: ItemEditorUi
  },
  {
    path: 'login',
    component: LoginUi,
    canActivate: [LoginGuard]
  },
  {
    path: 'user',
    component: UserUi,
    canActivate: [AuthGuard]
  },
  {
    path: 'http/:code',
    component: HttpRespUi
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  }
];
