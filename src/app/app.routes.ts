import { Routes } from '@angular/router';
import { DashboardUi } from './pages/dashboard-ui/dashboard-ui';
import { ItemUi } from './pages/item-ui/item-ui';
import { ItemEditorUi } from './pages/item-editor-ui/item-editor-ui';
import { UserUi } from './pages/user-ui/user-ui';
import { HttpRespUi } from './pages/http-resp-ui/http-resp-ui';

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
    path: 'edit-item/:id',
    component: ItemEditorUi
  },
  {
    path: 'new-item',
    component: ItemEditorUi
  },
  {
    path: 'user',
    component: UserUi
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
