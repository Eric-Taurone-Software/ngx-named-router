# ngx-named-router

[![npm version](https://badge.fury.io/js/ngx-named-router.svg)](https://www.npmjs.com/package/ngx-named-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Angular library that brings **named route navigation** to your Angular applications. Navigate using semantic route names instead of brittle URL paths, making your code more maintainable and refactor-friendly.

## Why ngx-named-router?

Traditional Angular routing requires hardcoded paths throughout your application:

```typescript
// ❌ Brittle - breaks when URLs change
this.router.navigate(['/users', userId, 'settings']);
```

With ngx-named-router, you use semantic names:

```typescript
// ✅ Maintainable - survives URL refactoring
this.namedRouter.navigate('user-settings', { routeParams: { userId: 123 } });
```

## Features

✅ **Named Route Navigation** - Use semantic names instead of URL paths  
✅ **Type-Safe Parameters** - Full TypeScript support for route and query parameters  
✅ **Directive Support** - `[namedRouterLink]` directive for templates  
✅ **Programmatic API** - Navigate from TypeScript code  
✅ **Lazy Loading Support** - Automatically discovers routes from lazy-loaded modules  
✅ **Error Handling** - Comprehensive validation and helpful error messages  
✅ **Fragment & Query Params** - Full support for URL fragments and query parameters  
✅ **Angular 20+ Compatible** - Built for modern Angular applications  
✅ **Standalone Components** - Fully standalone, no NgModules required

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
    - [Template Navigation (Directive)](#template-navigation-directive)
    - [Programmatic Navigation](#programmatic-navigation)
    - [Advanced Features](#advanced-features)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install ngx-named-router
```

**Peer Dependencies:**
- `@angular/common` ^20.0.0 or higher
- `@angular/core` ^20.0.0 or higher
- `@angular/router` ^20.0.0 or higher

---

## Quick Start

### 1. Define Named Routes

Add `name` properties to your route configuration:

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { NamedRoute } from 'ngx-named-router';

export const routes: NamedRoute[] = [
  { 
    path: '', 
    component: HomeComponent, 
    name: 'home' 
  },
  { 
    path: 'users/:id', 
    component: UserDetailComponent, 
    name: 'user-detail' 
  },
  { 
    path: 'users/:id/settings', 
    component: UserSettingsComponent, 
    name: 'user-settings' 
  },
  {
    path: 'products',
    name: 'products',
    loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
  }
];
```

### 2. Configure Application

In your `app.config.ts`, add the named routes provider:

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNamedRoutes } from 'ngx-named-router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNamedRoutes()  // 👈 Add this
  ]
};
```

### 3. Use in Templates

```typescript
// user-list.component.ts
import { Component } from '@angular/core';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  template: `
    <a [namedRouterLink]="'user-detail'" 
       [routeParams]="{id: 123}">
      View User 123
    </a>
    
    <a [namedRouterLink]="'user-settings'" 
       [routeParams]="{id: 456}"
       [queryParams]="{tab: 'profile'}">
      Edit User Settings
    </a>
  `
})
export class UserListComponent {}
```

### 4. Use Programmatically

```typescript
// user-list.component.ts
import { Component, inject } from '@angular/core';
import { NamedRouterService } from 'ngx-named-router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `<button (click)="viewUser(123)">View User</button>`
})
export class UserListComponent {
  private namedRouter = inject(NamedRouterService);

  viewUser(userId: number) {
    this.namedRouter.navigate('user-detail', {
      routeParams: { id: userId },
      queryParams: { source: 'list' }
    });
  }
}
```

---

## Configuration

### Basic Setup

The library requires minimal configuration. Simply add `provideNamedRoutes()` to your application providers:

```typescript
import { provideNamedRoutes } from 'ngx-named-router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNamedRoutes()
  ]
};
```

### Route Naming Conventions

We recommend these naming conventions for route names:

- **Use kebab-case**: `'user-detail'` not `'userDetail'`
- **Be descriptive**: `'admin-user-settings'` not `'settings'`
- **Include context**: `'product-reviews'` not just `'reviews'`
- **Unique across app**: Each name must be unique globally

### Lazy-Loaded Modules

Named routes automatically work with lazy-loaded modules:

```typescript
// products/products.routes.ts
import { NamedRoute } from 'ngx-named-router';

export const PRODUCTS_ROUTES: NamedRoute[] = [
  { path: '', component: ProductListComponent, name: 'product-list' },
  { path: ':id', component: ProductDetailComponent, name: 'product-detail' }
];

// app.routes.ts
{
  path: 'products',
  loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
}
```

The library will automatically discover and register routes from lazy-loaded modules.

---

## Usage

### Template Navigation (Directive)

The `NamedRouterLinkDirective` works like Angular's `routerLink` but uses route names:

#### Basic Navigation

```html
<a [namedRouterLink]="'home'">Home</a>
```

#### With Route Parameters

```html
<a [namedRouterLink]="'user-detail'" 
   [routeParams]="{id: user.id}">
  View Profile
</a>
```

#### With Query Parameters

```html
<a [namedRouterLink]="'products'" 
   [queryParams]="{category: 'electronics', sort: 'price'}">
  Electronics
</a>
```

#### With Fragment

```html
<a [namedRouterLink]="'docs'" 
   [fragment]="'getting-started'">
  Documentation
</a>
```

#### Open in New Tab

```html
<a [namedRouterLink]="'external-resource'" 
   target="_blank">
  Open in New Tab
</a>
```

#### Complete Example

```html
<a [namedRouterLink]="'user-posts'"
   [routeParams]="{userId: user.id, postId: post.id}"
   [queryParams]="{edit: true, tab: 'comments'}"
   [fragment]="'comment-section'"
   [skipLocationChange]="false"
   [replaceUrl]="false">
  Edit Post Comments
</a>
```

### Programmatic Navigation

Use `NamedRouterService` for navigation from TypeScript code:

#### Basic Navigation

```typescript
import { inject } from '@angular/core';
import { NamedRouterService } from 'ngx-named-router';

export class MyComponent {
  private namedRouter = inject(NamedRouterService);

  goHome() {
    this.namedRouter.navigate('home');
  }
}
```

#### With Parameters

```typescript
viewUser(userId: number) {
  this.namedRouter.navigate('user-detail', {
    routeParams: { id: userId }
  });
}
```

#### With Query Parameters

```typescript
searchProducts(category: string) {
  this.namedRouter.navigate('products', {
    queryParams: { 
      category: category,
      page: 1,
      sort: 'price'
    }
  });
}
```

#### With Navigation Extras

```typescript
updateSettings() {
  this.namedRouter.navigate('user-settings', {
    routeParams: { id: this.userId },
    replaceUrl: true,
    skipLocationChange: false,
    fragment: 'security'
  });
}
```

#### Generate URLs Without Navigating

```typescript
// Create a URL tree
const urlTree = this.namedRouter.createUrlTree('user-detail', {
  routeParams: { id: 123 }
});

// Serialize to string
const url = this.namedRouter.serializeUrl('user-detail', {
  routeParams: { id: 123 },
  queryParams: { tab: 'posts' }
});
// Returns: '/users/123?tab=posts'
```

#### Check if Route Exists

```typescript
if (this.namedRouter.hasRoute('admin-panel')) {
  // Route exists
}
```

#### Get All Route Names

```typescript
const allRoutes = this.namedRouter.getAllRouteNames();
console.log('Available routes:', allRoutes);
```

### Advanced Features

#### Optional Parameters

Routes can have optional parameters:

```typescript
// Route definition
{ path: 'users/:id?', name: 'user-maybe' }

// Usage without parameter
this.namedRouter.navigate('user-maybe', {});
// Navigates to: /users

// Usage with parameter
this.namedRouter.navigate('user-maybe', {
  routeParams: { id: 123 }
});
// Navigates to: /users/123
```

#### Parameter Constraints

Parameters with regex constraints are supported:

```typescript
// Route definition
{ path: 'users/:id(\\d+)', name: 'user-by-id' }

// The constraint pattern is automatically extracted
this.namedRouter.navigate('user-by-id', {
  routeParams: { id: 999 }
});
```

#### Special Characters in Parameters

Parameters are automatically URL-encoded:

```typescript
this.namedRouter.navigate('search', {
  routeParams: { query: 'hello world & more' }
});
// Navigates to: /search/hello%20world%20%26%20more
```

#### Dynamic Route Updates

If routes change dynamically, refresh the registry:

```typescript
import { NamedRouteService } from 'ngx-named-router';

export class MyComponent {
  private routeService = inject(NamedRouteService);

  async reloadRoutes() {
    await this.routeService.refresh();
  }
}
```

---

## API Reference

### `provideNamedRoutes()`

Function to configure the named routes service in your application.

**Usage:**
```typescript
import { provideNamedRoutes } from 'ngx-named-router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNamedRoutes()
  ]
};
```

---

### `NamedRouterLinkDirective`

Directive for template-based navigation.

**Selector:** `[namedRouterLink]`

**Inputs:**

| Input | Type | Description |
|-------|------|-------------|
| `namedRouterLink` | `string` | The name of the route to navigate to |
| `routeParams` | `RouteParams` | Object with route parameters (e.g., `{id: 123}`) |
| `queryParams` | `QueryParams` | Object with query parameters |
| `fragment` | `string` | URL fragment (hash) |
| `target` | `string` | Link target (`_blank`, `_self`, etc.) |
| `preserveFragment` | `boolean` | Whether to preserve existing fragment |
| `skipLocationChange` | `boolean` | Skip updating browser URL |
| `replaceUrl` | `boolean` | Replace current state in history |

**Example:**
```html
<a [namedRouterLink]="'user-detail'"
   [routeParams]="{id: 123}"
   [queryParams]="{tab: 'posts'}"
   [fragment]="'comments'">
  View User
</a>
```

---

### `NamedRouterService`

Service for programmatic navigation.

#### Methods

**`navigate(routeName: string, extras?: NamedNavigationExtras): Promise<boolean>`**

Navigate to a named route.

```typescript
await this.namedRouter.navigate('user-detail', {
  routeParams: { id: 123 },
  queryParams: { edit: true }
});
```

**`createUrlTree(routeName: string, extras?: NamedNavigationExtras): UrlTree`**

Create a URL tree without navigating.

```typescript
const urlTree = this.namedRouter.createUrlTree('user-detail', {
  routeParams: { id: 123 }
});
```

**`serializeUrl(routeName: string, extras?: NamedNavigationExtras): string`**

Generate a URL string.

```typescript
const url = this.namedRouter.serializeUrl('user-detail', {
  routeParams: { id: 123 }
});
// Returns: '/users/123'
```

**`hasRoute(routeName: string): boolean`**

Check if a route name exists.

```typescript
if (this.namedRouter.hasRoute('admin-panel')) {
  // Route exists
}
```

**`getAllRouteNames(): string[]`**

Get all registered route names.

```typescript
const routes = this.namedRouter.getAllRouteNames();
```

---

### `NamedRouteService`

Low-level service for route registry management (typically not used directly).

#### Methods

**`initialize(): Promise<void>`**

Initialize the route registry. Called automatically by `provideNamedRoutes()`.

**`getRoutePath(name: string): string | undefined`**

Get the path pattern for a route name.

**`refresh(): Promise<void>`**

Re-scan and rebuild the route registry.

**`reset(): void`**

Clear the route registry.

---

### Types

**`NamedRoute`**

Extended route interface with optional `name` property:

```typescript
interface NamedRoute extends Route {
  name?: string;
  children?: NamedRoute[];
}
```

**`RouteParams`**

Type for route parameters:

```typescript
type RouteParams = { [key: string]: string | number };
```

**`QueryParams`**

Type for query parameters:

```typescript
type QueryParams = { 
  [key: string]: string | number | boolean | (string | number)[] 
};
```

**`NamedNavigationExtras`**

Options for navigation:

```typescript
interface NamedNavigationExtras extends Omit<NavigationExtras, 'queryParams'> {
  routeParams?: RouteParams;
  queryParams?: QueryParams;
}
```

---

### Error Classes

**`NamedRouteError`**

Thrown when route configuration is invalid or navigation fails.

**`DuplicateRouteNameError`**

Thrown when duplicate route names are detected.

```typescript
try {
  await this.namedRouter.navigate('invalid-route');
} catch (error) {
  if (error instanceof NamedRouteError) {
    console.error('Route error:', error.message);
  }
}
```

---

## Architecture

### How It Works

1. **Initialization**: On app bootstrap, `provideNamedRoutes()` triggers route scanning
2. **Route Discovery**: The service recursively scans all routes (including lazy-loaded)
3. **Registry Building**: Routes with `name` properties are registered in a Map
4. **Runtime Navigation**: Navigation lookups use the registry to resolve names to paths
5. **Parameter Interpolation**: Route parameters are interpolated and URL-encoded
6. **Standard Navigation**: Angular Router handles the actual navigation

### Design Principles

- **Zero Runtime Overhead**: Route registry built once at startup
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Resilience**: Comprehensive validation and helpful error messages
- **Framework Integration**: Built on Angular Router primitives
- **Lazy Loading**: Automatic discovery of lazy routes
- **Memory Efficient**: Minimal memory footprint with Map-based registry

---

## Best Practices

### 1. Consistent Naming

```typescript
// ✅ Good - descriptive and consistent
'home'
'user-detail'
'admin-user-settings'
'product-reviews'

// ❌ Bad - inconsistent or vague
'userDetail'  // Not kebab-case
'settings'    // Too vague
'page1'       // Not descriptive
```

### 2. Centralized Route Names

Create a constants file for route names:

```typescript
// routes/route-names.ts
export const ROUTE_NAMES = {
  HOME: 'home',
  USER_DETAIL: 'user-detail',
  USER_SETTINGS: 'user-settings',
  ADMIN_DASHBOARD: 'admin-dashboard'
} as const;

// Usage
this.namedRouter.navigate(ROUTE_NAMES.USER_DETAIL, {
  routeParams: { id: 123 }
});
```

### 3. Type-Safe Route Params

Define interfaces for route parameters:

```typescript
interface UserDetailParams {
  id: number;
}

interface ProductSearchParams {
  category: string;
  page: number;
  sort?: string;
}

// Usage with type safety
const params: UserDetailParams = { id: 123 };
this.namedRouter.navigate('user-detail', { routeParams: params });
```

### 4. Error Handling

Always handle navigation errors:

```typescript
async navigateToUser(userId: number) {
  try {
    const success = await this.namedRouter.navigate('user-detail', {
      routeParams: { id: userId }
    });
    
    if (!success) {
      console.error('Navigation was cancelled');
    }
  } catch (error) {
    if (error instanceof NamedRouteError) {
      console.error('Route error:', error.message);
      // Fallback to home or show error message
      this.namedRouter.navigate('home');
    }
  }
}
```

### 5. Guard Integration

Use with route guards:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private namedRouter = inject(NamedRouterService);

  canActivate(): boolean {
    const isAuthenticated = this.checkAuth();
    
    if (!isAuthenticated) {
      this.namedRouter.navigate('login', {
        queryParams: { returnUrl: window.location.pathname }
      });
      return false;
    }
    
    return true;
  }
}
```

---

## Troubleshooting

### Route Not Found

**Problem:** `Route 'xxx' not found in registry`

**Solutions:**
1. Ensure the route has a `name` property
2. Check for typos in the route name
3. Verify initialization completed (routes should appear in console on startup)
4. For lazy routes, ensure they've been loaded at least once

### Duplicate Route Names

**Problem:** `DuplicateRouteNameError: Duplicate route name 'xxx' detected`

**Solutions:**
1. Use unique names across your entire application
2. Add context to names: `'admin-users'` vs `'public-users'`
3. Use prefixes for feature modules: `'products-list'`, `'products-detail'`

### Missing Required Parameters

**Problem:** `Missing required route parameters: id`

**Solutions:**
1. Provide all required parameters in `routeParams`
2. Make parameters optional in route definition: `:id?`
3. Check parameter names match route definition exactly

### Lazy Routes Not Registered

**Problem:** Lazy-loaded routes don't appear in registry

**Solutions:**
1. Navigate to the lazy route at least once
2. Use `refresh()` after dynamic route changes
3. Ensure lazy module exports routes correctly

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Ensure build passes: `npm run build:lib`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ngx-named-router.git
cd ngx-named-router/named-router-workspace

# Install dependencies
npm install

# Build the library
npm run build:lib

# Run tests
npm test

# Run demo app
npm start
```

---

## License

MIT © Eric Taurone

See [LICENSE](LICENSE) file for details.

---

## Changelog

### v0.0.1 (2026-01-07)

**Initial Release**

- ✨ Named route navigation with directive and programmatic API
- ✨ Full TypeScript support
- ✨ Lazy loading support
- ✨ Comprehensive error handling
- ✨ Fragment and query parameter support
- ✨ Angular 20+ compatibility
- ✨ Standalone components

---

## Support

- 📖 [Documentation](https://github.com/yourusername/ngx-named-router#readme)
- 🐛 [Issue Tracker](https://github.com/yourusername/ngx-named-router/issues)
- 💬 [Discussions](https://github.com/yourusername/ngx-named-router/discussions)

---

**Made with ❤️ for the Angular community**

