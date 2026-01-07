import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { NamedRouterLinkDirective } from './named-router-link.directive';
import { NamedRouteService } from '../services/named-route.service';

@Component({
  template: `
    <a [namedRouterLink]="routeName"
       [routeParams]="params"
       [queryParams]="query"
       [fragment]="fragment"
       [target]="target"
       id="test-link">Test Link</a>
  `,
  standalone: true,
  imports: [NamedRouterLinkDirective]
})
class TestComponent {
  @Input() routeName = 'home';
  params = {};
  query = {};
  fragment?: string;
  target?: string;
}

describe('Feature: NamedRouterLinkDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let linkElement: DebugElement;
  let mockRouter: Partial<Router>;
  let mockRouteService: Partial<NamedRouteService>;
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    // Given: Create mock objects
    mockRouter = {
      createUrlTree: vi.fn(),
      navigateByUrl: vi.fn(),
      serializeUrl: vi.fn()
    };
    mockRouteService = {
      getRoutePath: vi.fn()
    };

    mockUrlTree = { toString: () => '/test' } as any as UrlTree;

    TestBed.configureTestingModule({
      imports: [TestComponent, NamedRouterLinkDirective],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: NamedRouteService, useValue: mockRouteService }
      ]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    linkElement = fixture.debugElement.query(By.css('#test-link'));
  });

  describe('Scenario: Link href generation', () => {
    it('should generate href for simple route', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/home');
      expect(mockRouteService.getRoutePath).toHaveBeenCalledWith('home');
      expect(mockRouter.serializeUrl).toHaveBeenCalledWith(mockUrlTree);
    });

    it('should generate href for empty path as root', () => {
      // Given
      component.routeName = 'home';
      (mockRouteService.getRoutePath as any).mockReturnValue('');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/');

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/');
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/'], expect.any(Object));
    });

    it('should generate href with route parameters', () => {
      // Given
      component.routeName = 'user-detail';
      component.params = { id: 123 };
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users/123');

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/users/123');
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '123'], expect.any(Object));
    });

    it('should generate href with query parameters', () => {
      // Given
      component.routeName = 'products';
      component.query = { category: 'electronics', page: 2 };
      (mockRouteService.getRoutePath as any).mockReturnValue('products');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/products?category=electronics&page=2');

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/products?category=electronics&page=2');
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['products'], {
        queryParams: { category: 'electronics', page: 2 },
        fragment: undefined,
        preserveFragment: undefined
      });
    });

    it('should generate href with fragment', () => {
      // Given
      component.routeName = 'docs';
      component.fragment = 'section-2';
      (mockRouteService.getRoutePath as any).mockReturnValue('docs');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/docs#section-2');

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/docs#section-2');
    });

    it('should update href when inputs change', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      fixture.detectChanges();

      expect(linkElement.nativeElement.getAttribute('href')).toBe('/home');

      // When: Change route name
      fixture.componentRef.setInput('routeName', 'about');
      (mockRouteService.getRoutePath as any).mockReturnValue('about');
      (mockRouter.serializeUrl as any).mockReturnValue('/about');
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBe('/about');
    });

    it('should set href to null for non-existent route', () => {
      // Given
      component.routeName = 'non-existent';
      (mockRouteService.getRoutePath as any).mockReturnValue(undefined);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        `NamedRouterLink: Could not find route with name 'non-existent'`
      );

      warnSpy.mockRestore();
    });

    it('should set href to null for empty route name', () => {
      // Given
      component.routeName = '';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('NamedRouterLink: Route name is empty or not provided');

      warnSpy.mockRestore();
    });

    it('should handle URL creation errors gracefully', () => {
      // Given
      component.routeName = 'broken';
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id');
      (mockRouter.createUrlTree as any).mockImplementation(() => {
        throw new Error('Invalid URL');
      });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBeNull();
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });

  describe('Scenario: Click navigation', () => {
    it('should navigate on primary mouse button click', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      (mockRouter.navigateByUrl as any).mockResolvedValue(true);
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(mockUrlTree, {
        skipLocationChange: undefined,
        replaceUrl: undefined
      });
    });

    it('should not navigate on middle mouse button click', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 1, // Middle button
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when Ctrl key is pressed', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        ctrlKey: true,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when Meta key is pressed', () => {
      // Given
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        metaKey: true,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when target is _blank', () => {
      // Given
      component.target = '_blank';
      (mockRouteService.getRoutePath as any).mockReturnValue('home');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/home');
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(linkElement.nativeElement.getAttribute('target')).toBe('_blank');
    });

    it('should not navigate if route name is empty', () => {
      // Given
      component.routeName = '';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should not navigate if route does not exist', () => {
      // Given
      component.routeName = 'non-existent';
      (mockRouteService.getRoutePath as any).mockReturnValue(undefined);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fixture.detectChanges();

      const clickEvent = new MouseEvent('click', {
        button: 0,
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      // When
      linkElement.nativeElement.dispatchEvent(clickEvent);

      // Then
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        `NamedRouterLink: Cannot navigate to unknown route 'non-existent'`
      );

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Scenario: Parameter interpolation', () => {
    it('should handle required parameters', () => {
      // Given
      component.routeName = 'user-detail';
      component.params = { id: 456 };
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users/456');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '456'], expect.any(Object));
    });

    it('should throw error for missing required parameters', () => {
      // Given
      component.routeName = 'user-detail';
      component.params = {}; // Missing id
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // When
      fixture.detectChanges();

      // Then
      expect(linkElement.nativeElement.getAttribute('href')).toBeNull();
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it('should handle optional parameters when provided', () => {
      // Given
      component.routeName = 'user-maybe';
      component.params = { id: 789 };
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id?');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users/789');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '789'], expect.any(Object));
    });

    it('should handle optional parameters when not provided', () => {
      // Given
      component.routeName = 'user-maybe';
      component.params = {};
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id?');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users'], expect.any(Object));
    });

    it('should encode special characters in parameters', () => {
      // Given
      component.routeName = 'search';
      component.params = { query: 'hello world & stuff' };
      (mockRouteService.getRoutePath as any).mockReturnValue('search/:query');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/search/hello%20world%20%26%20stuff');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['search', 'hello%20world%20%26%20stuff'],
        expect.any(Object)
      );
    });

    it('should handle parameters with constraint patterns', () => {
      // Given
      component.routeName = 'user-detail';
      component.params = { id: 999 };
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:id(\\d+)');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users/999');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['users', '999'], expect.any(Object));
    });

    it('should handle multiple parameters', () => {
      // Given
      component.routeName = 'user-post';
      component.params = { userId: 123, postId: 456 };
      (mockRouteService.getRoutePath as any).mockReturnValue('users/:userId/posts/:postId');
      (mockRouter.createUrlTree as any).mockReturnValue(mockUrlTree);
      (mockRouter.serializeUrl as any).mockReturnValue('/users/123/posts/456');

      // When
      fixture.detectChanges();

      // Then
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['users', '123', 'posts', '456'],
        expect.any(Object)
      );
    });
  });
});

