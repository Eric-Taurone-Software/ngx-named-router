import { Injectable } from '@angular/core';
import { Router, NavigationExtras, UrlTree, Params } from '@angular/router';
import { NamedRouteService } from './named-route.service';
import { RouteParams, QueryParams } from '../models/named-route.model';

/**
 * Options for named route navigation
 */
export interface NamedNavigationExtras extends Omit<NavigationExtras, 'queryParams'> {
  /**
   * Route parameters to interpolate into the path
   */
  routeParams?: RouteParams;

  /**
   * Query parameters to append to the URL
   */
  queryParams?: QueryParams;
}

/**
 * Service for programmatic navigation using named routes.
 * Provides a higher-level API on top of Angular Router.
 *
 * @example
 * constructor(private namedRouter: NamedRouterService) {}
 *
 * navigateToUser() {
 *   this.namedRouter.navigate('user-detail', {
 *     routeParams: { id: 123 },
 *     queryParams: { tab: 'profile' }
 *   });
 * }
 */
@Injectable({ providedIn: 'root' })
export class NamedRouterService {
  constructor(
    private router: Router,
    private namedRouteService: NamedRouteService
  ) {}

  /**
   * Navigate to a named route
   *
   * @param routeName The name of the route to navigate to
   * @param extras Navigation options including route params and query params
   * @returns A promise that resolves when navigation completes
   * @throws Error if the route name is not found or navigation fails
   *
   * @example
   * await this.namedRouter.navigate('user-detail', {
   *   routeParams: { id: 123 },
   *   queryParams: { edit: true }
   * });
   */
  async navigate(routeName: string, extras?: NamedNavigationExtras): Promise<boolean> {
    if (!routeName) {
      throw new Error('NamedRouterService: Route name must be a non-empty string');
    }

    const pathPattern = this.namedRouteService.getRoutePath(routeName);

    if (pathPattern === undefined) {
      throw new Error(`NamedRouterService: Route '${routeName}' not found in registry`);
    }

    try {
      const urlTree = this.createUrlTreeFromPattern(pathPattern, extras);
      return await this.router.navigateByUrl(urlTree, this.extractNavigationExtras(extras));
    } catch (error) {
      throw new Error(
        `NamedRouterService: Navigation to '${routeName}' failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Navigate to a named route by URL
   *
   * @param routeName The name of the route
   * @param extras Navigation options
   * @returns A promise that resolves to the URL string
   * @throws Error if the route name is not found
   */
  async navigateByUrl(routeName: string, extras?: NamedNavigationExtras): Promise<boolean> {
    return this.navigate(routeName, extras);
  }

  /**
   * Create a URL tree for a named route without navigating
   *
   * @param routeName The name of the route
   * @param extras Navigation options
   * @returns A UrlTree that can be used for navigation or serialization
   * @throws Error if the route name is not found
   *
   * @example
   * const urlTree = this.namedRouter.createUrlTree('user-detail', {
   *   routeParams: { id: 123 }
   * });
   * const url = this.router.serializeUrl(urlTree);
   */
  createUrlTree(routeName: string, extras?: NamedNavigationExtras): UrlTree {
    if (!routeName) {
      throw new Error('NamedRouterService: Route name must be a non-empty string');
    }

    const pathPattern = this.namedRouteService.getRoutePath(routeName);

    if (pathPattern === undefined) {
      throw new Error(`NamedRouterService: Route '${routeName}' not found in registry`);
    }

    return this.createUrlTreeFromPattern(pathPattern, extras);
  }

  /**
   * Generate a URL string for a named route
   *
   * @param routeName The name of the route
   * @param extras Navigation options
   * @returns The serialized URL string
   * @throws Error if the route name is not found
   *
   * @example
   * const url = this.namedRouter.serializeUrl('user-detail', {
   *   routeParams: { id: 123 },
   *   queryParams: { tab: 'settings' }
   * });
   * // Returns: '/users/123?tab=settings'
   */
  serializeUrl(routeName: string, extras?: NamedNavigationExtras): string {
    const urlTree = this.createUrlTree(routeName, extras);
    return this.router.serializeUrl(urlTree);
  }

  /**
   * Check if a named route exists
   *
   * @param routeName The route name to check
   * @returns True if the route exists
   */
  hasRoute(routeName: string): boolean {
    return this.namedRouteService.hasRoute(routeName);
  }

  /**
   * Get all registered route names
   *
   * @returns Array of route names
   */
  getAllRouteNames(): string[] {
    return this.namedRouteService.getAllRouteNames();
  }

  private createUrlTreeFromPattern(pathPattern: string, extras?: NamedNavigationExtras): UrlTree {
    const segments = this.interpolatePathParams(pathPattern, extras?.routeParams || {});

    // Convert queryParams to proper Params type
    const params: Params = {};
    if (extras?.queryParams) {
      for (const [key, value] of Object.entries(extras.queryParams)) {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      }
    }

    return this.router.createUrlTree(segments, {
      queryParams: params,
      fragment: extras?.fragment,
      preserveFragment: extras?.preserveFragment,
      queryParamsHandling: extras?.queryParamsHandling
    });
  }

  private interpolatePathParams(pathPattern: string, routeParams: RouteParams): string[] {
    if (!pathPattern) {
      return ['/'];
    }

    const segments = pathPattern.split('/').filter(s => s.length > 0);
    const result: string[] = [];
    const missingParams: string[] = [];

    for (let segment of segments) {
      // Handle path parameters (e.g., :id, :userId)
      if (segment.startsWith(':')) {
        const isOptional = segment.endsWith('?');
        let paramName = segment.substring(1);

        // Remove optional marker
        if (isOptional) {
          paramName = paramName.slice(0, -1);
        }

        // Remove constraint pattern if present (e.g., :id(\d+) -> id)
        const parenIndex = paramName.indexOf('(');
        if (parenIndex !== -1) {
          paramName = paramName.substring(0, parenIndex);
        }

        const paramValue = routeParams[paramName];

        if (paramValue !== undefined && paramValue !== null) {
          // Encode the parameter value to handle special characters
          result.push(encodeURIComponent(String(paramValue)));
        } else if (!isOptional) {
          // Required parameter is missing
          missingParams.push(paramName);
        }
        // Skip optional parameters that aren't provided
      } else {
        // Regular path segment
        result.push(segment);
      }
    }

    if (missingParams.length > 0) {
      throw new Error(
        `Missing required route parameters: ${missingParams.join(', ')}`
      );
    }

    return result;
  }

  private extractNavigationExtras(extras?: NamedNavigationExtras): NavigationExtras {
    if (!extras) {
      return {};
    }

    const { routeParams, queryParams, ...navigationExtras } = extras;
    return navigationExtras;
  }
}

