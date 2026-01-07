import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { Injector } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NamedRouteService } from './named-route.service';
import { NamedRouteError, DuplicateRouteNameError } from '../errors/errors';
import { NamedRoute } from '../models/named-route.model';

describe('NamedRouteService', () => {
  let service: NamedRouteService;
  let mockRouter: Partial<Router>;
  let mockInjector: Partial<Injector>;

  beforeEach(() => {
    // Given: Create mock objects for dependencies
    mockRouter = {
      config: [],
      createUrlTree: vi.fn(),
      navigateByUrl: vi.fn(),
      serializeUrl: vi.fn()
    };
    mockInjector = {
      get: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        NamedRouteService,
        { provide: Router, useValue: mockRouter },
        { provide: Injector, useValue: mockInjector }
      ]
    });

    service = TestBed.inject(NamedRouteService);
  });

  describe('initialize', () => {
    it('should initialize with simple routes', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' },
        { path: 'about', name: 'about' }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('home')).to.equal('home');
      expect(service.getRoutePath('about')).to.equal('about');
    });

    it('should handle nested routes with parent paths', async () => {
      // Given
      const routes: NamedRoute[] = [
        {
          path: 'users',
          name: 'users',
          children: [
            { path: ':id', name: 'user-detail' },
            { path: ':id/edit', name: 'user-edit' }
          ]
        }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('users')).toBe('users');
      expect(service.getRoutePath('user-detail')).toBe('users/:id');
      expect(service.getRoutePath('user-edit')).toBe('users/:id/edit');
    });

    it('should handle routes without names', async () => {
      // Given
      const routes: Routes = [
        { path: 'unnamed' },
        { path: 'named', name: 'named-route' } as NamedRoute
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('named-route')).toBe('named');
      expect(service.getRoutePath('unnamed')).toBeUndefined();
    });

    it('should throw error when router config is not available', async () => {
      // Given
      mockRouter.config = undefined as any;

      // When/Then

      await expect(service.initialize()).rejects.toThrow(NamedRouteError);
      await expect(service.initialize()).rejects.toThrow(/Router configuration is not available/);
    });

    it('should handle lazy loaded routes with array export', async () => {
      // Given
      const lazyRoutes: Routes = [
        { path: 'lazy-detail', name: 'lazy-detail' } as NamedRoute
      ];

      const routes: Routes = [
        {
          path: 'lazy',
          loadChildren: vi.fn().mockResolvedValue(lazyRoutes)
        }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('lazy-detail')).toBe('lazy/lazy-detail');
    });

    it('should handle lazy loaded routes with default export', async () => {
      // Given
      const lazyRoutes: Routes = [
        { path: 'lazy-page', name: 'lazy-page' } as NamedRoute
      ];

      const routes: Routes = [
        {
          path: 'lazy',
          loadChildren: vi.fn().mockResolvedValue({ default: lazyRoutes })
        }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('lazy-page')).toBe('lazy/lazy-page');
    });

    it('should handle lazy loaded routes with routes property', async () => {
      // Given
      const lazyRoutes: Routes = [
        { path: 'feature', name: 'feature' } as NamedRoute
      ];

      const routes: Routes = [
        {
          path: 'lazy',
          loadChildren: vi.fn().mockResolvedValue({ routes: lazyRoutes })
        }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('feature')).toBe('lazy/feature');
    });

    it('should throw DuplicateRouteNameError for duplicate route names', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'first', name: 'duplicate' },
        { path: 'second', name: 'duplicate' }
      ];
      mockRouter.config = routes;

      // When/Then
      await expect(service.initialize()).rejects.toThrow(DuplicateRouteNameError);
      await expect(service.initialize()).rejects.toThrow(/Duplicate route name 'duplicate'/);
    });

    it('should only initialize once on multiple calls', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();
      await service.initialize();
      await service.initialize();

      // Then
      expect(service.getRoutePath('home')).toBe('home');
    });

    it('should handle concurrent initialization calls', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' }
      ];
      mockRouter.config = routes;

      // When
      const promises = [
        service.initialize(),
        service.initialize(),
        service.initialize()
      ];
      await Promise.all(promises);

      // Then
      expect(service.getRoutePath('home')).toBe('home');
    });

    it('should handle empty path segments', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: '', name: 'root' },
        { path: 'users/', name: 'users' }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('root')).toBe('');
      expect(service.getRoutePath('users')).toBe('users/');
    });

    it('should handle loadChildren that throws an error', async () => {
      // Given
      const routes: Routes = [
        {
          path: 'lazy',
          loadChildren: vi.fn().mockRejectedValue(new Error('Failed to load'))
        }
      ];
      mockRouter.config = routes;

      // When/Then
      await expect(service.initialize()).rejects.toThrow(NamedRouteError);
      await expect(service.initialize()).rejects.toThrow(/Failed to load lazy module/);
    });

    it('should warn for empty route names', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'test', name: '   ' }
      ];
      mockRouter.config = routes;
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      await service.initialize();

      // Then
      expect(warnSpy).toHaveBeenCalledWith('Attempted to register route with empty name, skipping');

      warnSpy.mockRestore();
    });
  });

  describe('getRoutePath', () => {
    beforeEach(async () => {
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' },
        { path: 'users/:id', name: 'user-detail' }
      ];
      mockRouter.config = routes;
      await service.initialize();
    });

    it('should return path for existing route', () => {
      // When
      const path = service.getRoutePath('home');

      // Then
      expect(path).toBe('home');
    });

    it('should return undefined for non-existent route', () => {
      // Given
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      const path = service.getRoutePath('non-existent');

      // Then
      expect(path).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith(
        `NamedRouteService: Route with name 'non-existent' not found in registry.`
      );

      warnSpy.mockRestore();
    });

    it('should return undefined for empty route name', () => {
      // Given
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      const path = service.getRoutePath('');

      // Then
      expect(path).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith(
        'NamedRouteService.getRoutePath: Invalid route name provided:',
        ''
      );

      warnSpy.mockRestore();
    });

    it('should handle reset clearing all routes', () => {
      // When
      service.reset();

      // Then (reset should clear everything)
      expect(service.getRoutePath('home')).toBeUndefined();
    });
  });

  describe('getAllRouteNames', () => {
    it('should return all registered route names', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' },
        { path: 'about', name: 'about' },
        { path: 'contact', name: 'contact' }
      ];
      mockRouter.config = routes;
      await service.initialize();

      // When
      const names = service.getAllRouteNames();

      // Then
      expect(names).toContain('home');
      expect(names).toContain('about');
      expect(names).toContain('contact');
      expect(names.length).toBe(3);
    });

    it('should return empty array before initialization', () => {
      // When
      const names = service.getAllRouteNames();

      // Then
      expect(names).toEqual([]);
    });
  });

  describe('hasRoute', () => {
    beforeEach(async () => {
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' },
        { path: 'users/:id', name: 'user-detail' }
      ];
      mockRouter.config = routes;
      await service.initialize();
    });

    it('should return true for existing route', () => {
      // When/Then
      expect(service.hasRoute('home')).toBe(true);
      expect(service.hasRoute('user-detail')).toBe(true);
    });

    it('should return false for non-existent route', () => {
      // When/Then
      expect(service.hasRoute('non-existent')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear all routes and reset initialization state', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' }
      ];
      mockRouter.config = routes;
      await service.initialize();

      // When
      service.reset();

      // Then
      expect(service.getAllRouteNames()).toEqual([]);
      expect(service.hasRoute('home')).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should reinitialize with updated routes', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' }
      ];
      mockRouter.config = routes;
      await service.initialize();

      // When: Change routes and refresh
      mockRouter.config = [
        { path: 'new-home', name: 'home' },
        { path: 'about', name: 'about' }
      ] as NamedRoute[];
      await service.refresh();

      // Then
      expect(service.getRoutePath('home')).to.equal('new-home');
      expect(service.getRoutePath('about')).to.equal('about');
    });
  });

  describe('complex routing scenarios', () => {
    it('should handle deeply nested routes', async () => {
      // Given
      const routes: NamedRoute[] = [
        {
          path: 'admin',
          name: 'admin',
          children: [
            {
              path: 'users',
              name: 'admin-users',
              children: [
                { path: ':id', name: 'admin-user-detail' },
                {
                  path: ':id/settings',
                  name: 'admin-user-settings',
                  children: [
                    { path: 'profile', name: 'admin-user-profile' }
                  ]
                }
              ]
            }
          ]
        }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('admin')).to.equal('admin');
      expect(service.getRoutePath('admin-users')).to.equal('admin/users');
      expect(service.getRoutePath('admin-user-detail')).to.equal('admin/users/:id');
      expect(service.getRoutePath('admin-user-settings')).to.equal('admin/users/:id/settings');
      expect(service.getRoutePath('admin-user-profile')).to.equal('admin/users/:id/settings/profile');
    });

    it('should handle mixed lazy and eager routes', async () => {
      // Given
      const lazyRoutes: Routes = [
        { path: 'lazy-feature', name: 'lazy-feature' } as NamedRoute
      ];

      const routes: NamedRoute[] = [
        { path: 'home', name: 'home' },
        {
          path: 'lazy',
          loadChildren: vi.fn().mockResolvedValue(lazyRoutes)
        },
        { path: 'about', name: 'about' }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('home')).to.equal('home');
      expect(service.getRoutePath('lazy-feature')).to.equal('lazy/lazy-feature');
      expect(service.getRoutePath('about')).to.equal('about');
    });

    it('should handle routes with optional parameters', async () => {
      // Given
      const routes: NamedRoute[] = [
        { path: 'users/:id?', name: 'user-maybe' }
      ];
      mockRouter.config = routes;

      // When
      await service.initialize();

      // Then
      expect(service.getRoutePath('user-maybe')).toBe('users/:id?');
    });
  });
});

