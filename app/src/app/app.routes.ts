import { Routes } from '@angular/router';
import { HomeComponent } from './public/Home/home/home.component';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', loadComponent: () => import('./public/Home/home/home.component').then(m => m.HomeComponent), data: { title: 'Inicio | Surfiando', description: 'Surf, música y agenda de eventos.' } },
    { path: 'eventos', loadComponent: () => import('./public/events/events.component').then(m => m.EventsComponent), data: { title: 'Eventos | Surfiando', description: 'Calendario y lista de eventos.' } },
    { path: 'galeria', loadComponent: () => import('./public/gallery/gallery.component').then(m => m.GalleryComponent), data: { title: 'Galería | Surfiando', description: 'Fotos y flyers.' } },
    {
      path: 'admin/login',
      loadComponent: () =>
        import('./admin/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
    },
    {
      path: 'admin',
      loadComponent: () =>
        import('./admin/admin-panel/admin-panel.component').then((m) => m.AdminPanelComponent),
      canActivate: [adminGuard],
    },
    { path: '**', redirectTo: '' }
];
