import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ComplaintFormComponent } from './components/complaint-form/complaint-form';
import { ComplaintListComponent } from './components/complaint-list/complaint-list';
import { ComplaintDetailComponent } from './components/complaint-detail/complaint-detail';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { AdminComplaintsComponent } from './components/admin-complaints/admin-complaints';
import { AdminComplaintDetailComponent } from './components/admin-complaint-detail/admin-complaint-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'complaint-form', component: ComplaintFormComponent },
  { path: 'complaints', component: ComplaintListComponent },
  { path: 'complaints/:id', component: ComplaintDetailComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/complaints', component: AdminComplaintsComponent },
  { path: 'admin/complaints/:id', component: AdminComplaintDetailComponent },
];
