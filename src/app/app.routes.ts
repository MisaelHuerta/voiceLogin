import { Routes } from '@angular/router';
import { Login } from './Views/Access/login/login';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', title: 'Inicio de sesión', component: Login}, 
];
