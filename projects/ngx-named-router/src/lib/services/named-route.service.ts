import { Injectable, Injector, Type } from '@angular/core';
import { Router, Routes, Route, ROUTES } from '@angular/router';
import { NamedRoute } from '../models/named-route.model';
import {DuplicateRouteNameError, NamedRouteError} from '../errors/errors';

@Injectable({ providedIn: 'root' })
export class NamedRouteService {
  private routeMap = new Map<string, string>();
  private isInitialized = false;
  private initializationPromise?: Promise<void>;

  constructor(private router: Router, private injector: Injector) {}

  /**
   * Scans the router config to build the name registry.
   * This forces the resolution of lazy routes to read their config.
   *
   * @throws {NamedRouteError} If router config is invalid or initialization fails
   * @throws {DuplicateRouteNameError} If duplicate route names are detected
   */
  async initialize(): Promise<void> {
    // Prevent concurrent initialization
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      const rootRoutes = this.router?.config;

      if (!rootRoutes) {
        throw new NamedRouteError('Router configuration is not available. Ensure the router is properly configured.');
      }

      await this.buildRouteMap(rootRoutes, '');
      this.isInitialized = true;
    } catch (error) {
      this.initializationPromise = undefined;

      if (error instanceof NamedRouteError) {
        throw error;
      }

      throw new NamedRouteError(
        `Failed to initialize named routes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets the path pattern for a named route
   *
   * @param name The route name to lookup
   * @returns The path pattern or undefined if not found
   */
  getRoutePath(name: string): string | undefined {
    if (!name) {
      console.warn('NamedRouteService.getRoutePath: Invalid route name provided:', name);
      return undefined;
    }

    const hasRoute = this.routeMap.has(name);
    const path = this.routeMap.get(name);

    if (!hasRoute && this.isInitialized) {
      console.warn(`NamedRouteService: Route with name '${name}' not found in registry.`);
    }

    return path;
  }

  /**
   * Gets all registered route names
   *
   * @returns Array of registered route names
   */
  getAllRouteNames(): string[] {
    return Array.from(this.routeMap.keys());
  }

  /**
   * Checks if a route name exists in the registry
   *
   * @param name The route name to check
   * @returns True if the route exists, false otherwise
   */
  hasRoute(name: string): boolean {
    return this.routeMap.has(name);
  }

  /**
   * Clears the route registry and resets initialization state.
   * Useful for testing or dynamic route reconfiguration.
   */
  reset(): void {
    this.routeMap.clear();
    this.isInitialized = false;
    this.initializationPromise = undefined;
  }

  /**
   * Re-initializes the route registry by scanning the current router configuration.
   * This is useful when routes are added or modified dynamically.
   *
   * @throws {NamedRouteError} If reinitialization fails
   */
  async refresh(): Promise<void> {
    this.reset();
    await this.initialize();
  }

  private async buildRouteMap(routes: Routes, parentPath: string): Promise<void> {
    if (!Array.isArray(routes)) {
      throw new NamedRouteError('Invalid routes configuration: expected an array');
    }

    for (const route of routes) {
      try {
        await this.processRoute(route, parentPath);
      } catch (error) {
        const routePath = route.path ?? '<no-path>';
        console.error(`Error processing route '${routePath}':`, error);

        if (error instanceof NamedRouteError) {
          throw error;
        }

        throw new NamedRouteError(
          `Failed to process route '${routePath}': ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  private async processRoute(route: Route, parentPath: string): Promise<void> {
    // 1. Resolve the path for this specific segment
    const fullPath = this.joinPaths(parentPath, route.path);

    // 2. Register if it has a name
    const namedRoute = route as NamedRoute;
    if (namedRoute.name) {
      this.registerRoute(namedRoute.name, fullPath);
    }

    // 3. Recurse into children
    if (route.children && Array.isArray(route.children)) {
      await this.buildRouteMap(route.children, fullPath);
    }

    // 4. Handle Lazy Loading
    if (route.loadChildren) {
      await this.processLazyRoute(route, fullPath);
    }
  }

  private registerRoute(name: string, path: string): void {
    if (!name.trim()) {
      console.warn('Attempted to register route with empty name, skipping');
      return;
    }

    const existingPath = this.routeMap.get(name);
    if (existingPath !== undefined) {
      throw new DuplicateRouteNameError(name, existingPath, path);
    }

    this.routeMap.set(name, path);
  }

  private async processLazyRoute(route: Route, fullPath: string): Promise<void> {
    try {
      const loaded = await route.loadChildren!();
      const childRoutes = this.extractRoutesFromLazyModule(loaded);

      if (childRoutes.length > 0) {
        await this.buildRouteMap(childRoutes, fullPath);
      }
    } catch (error) {
      throw new NamedRouteError(
        `Failed to load lazy module at path '${fullPath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private extractRoutesFromLazyModule(loaded: any): Routes {
    // Modern: loadChildren returns Routes[] directly (Standalone components)
    if (Array.isArray(loaded)) {
      return loaded;
    }

    // ES Module with default export of routes
    if (loaded && typeof loaded === 'object') {
      if (Array.isArray(loaded.default)) {
        return loaded.default;
      }

      if (Array.isArray(loaded.routes)) {
        return loaded.routes;
      }

      // NgModule-based lazy loading (check for Angular module marker)
      const hasModuleMetadata = typeof loaded === 'function' ||
        (loaded && typeof loaded === 'object' && Object.keys(loaded).some(k => k.includes('mod')));

      if (hasModuleMetadata) {
        return this.extractRoutesFromNgModule(loaded);
      }
    }

    // Legacy: loadChildren returns a Module Class
    if (typeof loaded === 'function') {
      return this.extractRoutesFromNgModule(loaded);
    }

    console.warn('Unable to extract routes from lazy module:', loaded);
    return [];
  }

  private extractRoutesFromNgModule(moduleType: Type<any>): Routes {
    try {
      // Try to get ROUTES token which may contain the module's routes
      try {
        const routes = this.injector.get(ROUTES, null);

        if (routes && Array.isArray(routes)) {
          return routes.flat();
        }
      } catch {
        // ROUTES token not available, try other methods
      }

      // If module has a static property for routes
      if ((moduleType as any).routes) {
        return (moduleType as any).routes;
      }

      console.warn('Could not extract routes from NgModule:', moduleType);
      return [];
    } catch (error) {
      console.warn('Error extracting routes from NgModule:', error);
      return [];
    }
  }

  private joinPaths(parent: string, child?: string): string {
    if (!child) return parent || '';
    if (!parent) return child;
    return `${parent}/${child}`.replace(/\/+/g, '/');
  }
}
