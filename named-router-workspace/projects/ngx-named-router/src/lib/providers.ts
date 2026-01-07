import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject
} from '@angular/core';
import { NamedRouteService } from './services/named-route.service';

export function provideNamedRoutes(): EnvironmentProviders {
  return makeEnvironmentProviders([
    NamedRouteService,
    provideAppInitializer(() => {
      const service = inject(NamedRouteService);
      return service.initialize();
    })
  ]);
}
