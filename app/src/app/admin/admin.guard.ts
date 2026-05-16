import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const configService = inject(ConfigService);
  const router = inject(Router);
  if (!isPlatformBrowser(platformId)) {
    return router.createUrlTree(['/admin/login']);
  }
  if (configService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/admin/login']);
};
