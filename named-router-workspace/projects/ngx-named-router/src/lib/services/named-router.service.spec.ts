import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { NamedRouterService } from './named-router.service';
import { NamedRouteService } from './named-route.service';

describe('NamedRouterService', () => {
  let service: NamedRouterService;
  let mockRouter: Partial<Router>;
  let mockNamedRouteService: Partial<NamedRouteService>;
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    // Given: Create mock objects for dependencies
    mockRouter = {
      createUrlTree: vi.fn(),
      navigateByUrl: vi.fn(),
      serializeUrl: vi.fn()
    };
    mockNamedRouteService = {
      getRoutePath: vi.fn(),
      hasRoute: vi.fn(),
      getAllRouteNames: vi.fn()
    };

    // Create a mock UrlTree
    mockUrlTree = { toString: () => '/test' } as any as UrlTree;

    TestBed.configureTestingModule({
      providers: [
        NamedRouterService,
        { provide: Router, useValue: mockRouter },
        { provide: NamedRouteService, useValue: mockNamedRouteService }
      ]
    });

    service = TestBed.inject(NamedRouterService);
  });

  describe('navigate', () => {
    it('should navigate to a named route without parameters', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      const result = await service.navigate('home');

      // Then
      expect(result).toBe(true);
      expect(mockNamedRouteService.getRoutePath).toHaveBeenCalledWith('home');
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['home'], {
        queryParams: {},
        fragment: undefined,
        preserveFragment: undefined,
        queryParamsHandling: undefined
      });
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(mockUrlTree, {});
    });

    it('should navigate with route parameters', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      const result = await service.navigate('user-detail', {
        routeParams: { id: 123 }
      });

      // Then
      expect(result).toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '123'], expect.any(Object));
    });

    it('should navigate with query parameters', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('products');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      const result = await service.navigate('products', {
        queryParams: { category: 'electronics', page: 2 }
      });

      // Then
      expect(result).toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['products'], {
        queryParams: { category: 'electronics', page: 2 },
        fragment: undefined,
        preserveFragment: undefined,
        queryParamsHandling: undefined
      });
    });

    it('should navigate with fragment', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('docs');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      const result = await service.navigate('docs', {
        fragment: 'section-2'
      });

      // Then
      expect(result).toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['docs'], {
        queryParams: {},
        fragment: 'section-2',
        preserveFragment: undefined,
        queryParamsHandling: undefined
      });
    });

    it('should throw error for empty route name', async () => {
      // When/Then
      await expect(service.navigate('')).rejects.toThrow('NamedRouterService: Route name must be a non-empty string');
    });

    it('should throw error for non-existent route', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue(undefined);

      // When/Then
      await expect(service.navigate('non-existent')).rejects.toThrow(/Route 'non-existent' not found in registry/);
    });

    it('should throw error when navigation fails', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockRejectedValue(new Error('Navigation failed'));

      // When/Then
      await expect(service.navigate('home')).rejects.toThrow(/Navigation to 'home' failed/);
    });

    it('should pass navigation extras to router', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      await service.navigate('home', {
        skipLocationChange: true,
        replaceUrl: true
      });

      // Then
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(mockUrlTree, {
        skipLocationChange: true,
        replaceUrl: true
      });
    });

    it('should encode special characters in route parameters', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('search/:query');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      await service.navigate('search', {
        routeParams: { query: 'hello world & stuff' }
      });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['search', 'hello%20world%20%26%20stuff'],
        expect.any(Object)
      );
    });

    it('should filter out undefined and null query parameters', async () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('products');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      await service.navigate('products', {
        queryParams: { category: 'electronics', page: null as any, sort: undefined as any }
      });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['products'], {
        queryParams: { category: 'electronics' },
        fragment: undefined,
        preserveFragment: undefined,
        queryParamsHandling: undefined
      });
    });
  });

  describe('createUrlTree', () => {
    it('should create URL tree for named route', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);

      // When
      const result = service.createUrlTree('user-detail', {
        routeParams: { id: 456 }
      });

      // Then
      expect(result).toBe(mockUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '456'], expect.any(Object));
    });

    it('should throw error for empty route name', () => {
      // When/Then
      expect(() => service.createUrlTree('')).toThrow(
        'NamedRouterService: Route name must be a non-empty string'
      );
    });

    it('should throw error for non-existent route', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue(undefined);

      // When/Then
      expect(() => service.createUrlTree('non-existent')).toThrow(
        /Route 'non-existent' not found in registry/
      );
    });
  });

  describe('serializeUrl', () => {
    it('should serialize URL for named route', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('products');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/products?category=electronics');

      // When
      const result = service.serializeUrl('products', {
        queryParams: { category: 'electronics' }
      });

      // Then
      expect(result).toBe('/products?category=electronics');
      expect(mockRouter.serializeUrl).toHaveBeenCalledWith(mockUrlTree);
    });
  });

  describe('hasRoute', () => {
    it('should delegate to NamedRouteService', () => {
      // Given
      (mockNamedRouteService.hasRoute as any).mockReturnValue(true);

      // When
      const result = service.hasRoute('home');

      // Then
      expect(result).toBe(true);
      expect(mockNamedRouteService.hasRoute).toHaveBeenCalledWith('home');
    });
  });

  describe('getAllRouteNames', () => {
    it('should delegate to NamedRouteService', () => {
      // Given
      const routeNames = ['home', 'about', 'contact'];
      (mockNamedRouteService.getAllRouteNames as any).mockReturnValue(routeNames);

      // When
      const result = service.getAllRouteNames();

      // Then
      expect(result).toBe(routeNames);
      expect(mockNamedRouteService.getAllRouteNames).toHaveBeenCalled();
    });
  });

  describe('path interpolation edge cases', () => {
    it('should handle optional parameters that are not provided', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id?');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      service.navigate('user-maybe', { routeParams: {} });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users'], expect.any(Object));
    });

    it('should handle optional parameters that are provided', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id?');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      service.navigate('user-maybe', { routeParams: { id: 789 } });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '789'], expect.any(Object));
    });

    it('should throw error for missing required parameters', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id/posts/:postId');

      // When/Then
      expect(() => service.createUrlTree('user-post', {
        routeParams: { id: 123 }
      })).toThrow(/Missing required route parameters: postId/);
    });

    it('should handle parameters with constraint patterns', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('users/:id(\\d+)');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      service.navigate('user-detail', { routeParams: { id: 123 } });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '123'], expect.any(Object));
    });

    it('should handle empty path', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);

      // When
      const urlTree = service.createUrlTree('root', {});

      // Then
      expect(urlTree).toBe(mockUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/'], expect.any(Object));
    });

    it('should handle multiple segments', () => {
      // Given
      (mockNamedRouteService.getRoutePath as any).mockReturnValue('admin/users/:id/settings');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);

      // When
      service.navigate('admin-settings', { routeParams: { id: 999 } });

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['admin', 'users', '999', 'settings'],
        expect.any(Object)
      );
    });
  });
});

