import { Routes } from '@angular/router';
import { AdminLoginComponent } from './admin/login/admin-login/admin-login.component';
import { HomeComponent } from './public/Home/home/home.component';
import { AdminGalleryComponent } from './admin/admin-gallery/admin-gallery.component';

export const routes: Routes = [
    { path: 'admin-gallery', component: AdminGalleryComponent },
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home', component: HomeComponent },
];
