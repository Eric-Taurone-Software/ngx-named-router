import { Directive, HostBinding, HostListener, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Router, UrlTree, Params } from '@angular/router';
import { NamedRouteService } from '../services/named-route.service';
import { RouteParams, QueryParams } from '../models/named-route.model';

/**
 * Directive for creating navigation links using named routes.
 *
 * @example
 * <a [namedRouterLink]="'user-detail'" [routeParams]="{id: 123}">View User</a>
 * <a [namedRouterLink]="'products'" [queryParams]="{category: 'electronics'}">Products</a>
 */
@Directive({
  selector: '[namedRouterLink]',
  standalone: true
})
export class NamedRouterLinkDirective implements OnChanges, OnInit {
  private static readonly MOUSE_PRIMARY_BUTTON = 0;

  /**
   * The name of the route to navigate to.
   * This should match the `name` property defined in your route configuration.
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'user-detail'">View User</a>
   * ```
   */
  @Input('namedRouterLink') name: string = '';

  /**
   * Route parameters to interpolate into the path.
   * Keys should match parameter names in the route path (e.g., `:id` in `users/:id`).
   * Values can be strings or numbers and will be properly URL-encoded.
   *
   * @example
   * ```html
   * <!-- Route: 'users/:id' -->
   * <a [namedRouterLink]="'user-detail'" [routeParams]="{id: 123}">View User 123</a>
   *
   * <!-- Route: 'users/:userId/posts/:postId' -->
   * <a [namedRouterLink]="'user-post'"
   *    [routeParams]="{userId: 456, postId: 789}">View Post</a>
   * ```
   */
  @Input() routeParams: RouteParams = {};

  /**
   * Query parameters to append to the URL.
   * These appear after the `?` in the URL (e.g., `?category=electronics&page=1`).
   * Values can be strings, numbers, booleans, or arrays.
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'products'"
   *    [queryParams]="{category: 'electronics', page: 1, sort: 'price'}">
   *   Electronics
   * </a>
   * ```
   */
  @Input() queryParams: QueryParams = {};

  /**
   * URL fragment (hash) to append to the URL.
   * This appears after the `#` in the URL and is typically used for in-page anchors.
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'docs'" [fragment]="'installation'">
   *   Go to Installation Section
   * </a>
   * <!-- Navigates to: /docs#installation -->
   * ```
   */
  @Input() fragment?: string;

  /**
   * Specifies where to open the linked document.
   * Common values: `_blank` (new tab), `_self` (same frame), `_parent`, `_top`.
   * When set to `_blank`, navigation will not be intercepted.
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'external-resource'" target="_blank">
   *   Open in New Tab
   * </a>
   * ```
   */
  @Input() target?: string;

  /**
   * Whether to preserve the existing URL fragment when navigating.
   * If `true`, the current fragment (if any) will be kept in the new URL.
   *
   * @default false
   *
   * @example
   * ```html
   * <!-- Current URL: /page1#section-2 -->
   * <a [namedRouterLink]="'page2'" [preserveFragment]="true">Next Page</a>
   * <!-- Navigates to: /page2#section-2 -->
   * ```
   */
  @Input() preserveFragment?: boolean;

  /**
   * When `true`, navigates without pushing a new state into the browser's history.
   * The URL in the browser will not change, but the application will navigate.
   * Useful for temporary navigation or modal-like views.
   *
   * @default false
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'preview'" [skipLocationChange]="true">
   *   Preview (no history)
   * </a>
   * ```
   */
  @Input() skipLocationChange?: boolean;

  /**
   * When `true`, replaces the current state in the browser's history instead of pushing a new state.
   * The back button will skip over this navigation.
   * Useful for redirect-like navigation flows.
   *
   * @default false
   *
   * @example
   * ```html
   * <a [namedRouterLink]="'login-success'" [replaceUrl]="true">
   *   Continue
   * </a>
   * ```
   */
  @Input() replaceUrl?: boolean;

  @HostBinding('attr.href') href: string | null = null;
  @HostBinding('attr.target') get targetAttr(): string | null {
    return this.target || null;
  }

  constructor(
    private router: Router,
    private routeService: NamedRouteService
  ) {}

  ngOnInit(): void {
    this.validateInputs();
    this.updateHref();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] || changes['routeParams'] || changes['queryParams'] || changes['fragment']) {
      this.validateInputs();
      this.updateHref();
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): boolean {
    // Allow default behavior for:
    // - Middle/right mouse button clicks
    // - Ctrl/Cmd key held (open in new tab)
    // - Target is _blank
    if (
      this.target === '_blank' ||
      event.button !== NamedRouterLinkDirective.MOUSE_PRIMARY_BUTTON ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return true;
    }

    event.preventDefault();
    this.navigate();
    return false;
  }

  private validateInputs(): void {
    if (!this.name) {
      console.warn('NamedRouterLink: Route name is empty or not provided');
    }
  }

  private updateHref(): void {
    if (!this.name) {
      this.href = null;
      return;
    }

    const pathPattern = this.routeService.getRoutePath(this.name);

    if (pathPattern === undefined) {
      this.href = null;
      console.warn(`NamedRouterLink: Could not find route with name '${this.name}'`);
      return;
    }

    try {
      const urlTree = this.createUrlTree(pathPattern);
      this.href = this.router.serializeUrl(urlTree);
    } catch (error) {
      this.href = null;
      console.error(
        `NamedRouterLink: Failed to create URL for route '${this.name}':`,
        error instanceof Error ? error.message : error
      );
    }
  }

  private navigate(): void {
    if (!this.name) {
      console.warn('NamedRouterLink: Cannot navigate without a route name');
      return;
    }

    const pathPattern = this.routeService.getRoutePath(this.name);
    if (pathPattern === undefined) {
      console.error(`NamedRouterLink: Cannot navigate to unknown route '${this.name}'`);
      return;
    }

    try {
      const urlTree = this.createUrlTree(pathPattern);
      this.router.navigateByUrl(urlTree, {
        skipLocationChange: this.skipLocationChange,
        replaceUrl: this.replaceUrl
      });
    } catch (error) {
      console.error(
        `NamedRouterLink: Navigation failed for route '${this.name}':`,
        error instanceof Error ? error.message : error
      );
    }
  }

  private createUrlTree(pathPattern: string): UrlTree {
    const segments = this.interpolatePathParams(pathPattern);

    // Convert queryParams to proper Params type
    const params: Params = {};
    for (const [key, value] of Object.entries(this.queryParams)) {
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    }

    return this.router.createUrlTree(segments, {
      queryParams: params,
      fragment: this.fragment,
      preserveFragment: this.preserveFragment
    });
  }

  private interpolatePathParams(pathPattern: string): string[] {
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

        const paramValue = this.routeParams[paramName];

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
        `Missing required route parameters for '${this.name}': ${missingParams.join(', ')}`
      );
    }

    return result;
  }
}
