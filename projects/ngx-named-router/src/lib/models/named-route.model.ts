import { Route } from '@angular/router';

/**
 * Extended Route interface that includes an optional name property
 * for named route registration.
 *
 * @example
 * const routes: NamedRoute[] = [
 *   { path: 'users/:id', component: UserComponent, name: 'user-detail' },
 *   { path: 'products', component: ProductsComponent, name: 'products' }
 * ];
 */
export interface NamedRoute extends Route {
  /**
   * Unique name identifier for this route.
   * Used for navigation via NamedRouterLinkDirective.
   */
  name?: string;

  /**
   * Child routes that can also have names
   */
  children?: NamedRoute[];
}

/**
 * Type-safe route parameters for navigation
 */
export type RouteParams = { [key: string]: string | number };

/**
 * Type-safe query parameters for navigation
 */
export type QueryParams = { [key: string]: string | number | boolean | (string | number)[] };


