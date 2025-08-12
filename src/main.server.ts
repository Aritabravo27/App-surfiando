// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, {
  ...config,
  providers: [
    // trae todos los providers que definas en config
    ...(config.providers ?? []),
    // importa el HttpClientModule para que HttpClient esté disponible
    importProvidersFrom(HttpClientModule),
  ]
});

export default bootstrap;
