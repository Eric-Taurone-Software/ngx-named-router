import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NamedRouteService, NamedRouterLinkDirective, NamedRouterService } from 'ngx-named-router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly namedRouter = inject(NamedRouterService);
  private readonly namedRouteService = inject(NamedRouteService);

  protected readonly userId = signal('42');
  protected readonly searchQuery = signal('routing');
  protected readonly constraintId = signal('7');
  protected readonly routeCheckName = signal('user-detail');

  protected readonly routeNames = signal<string[]>([]);
  protected readonly routeExists = signal<boolean | null>(null);
  protected readonly urlPreview = signal('');
  protected readonly urlTreePreview = signal('');
  protected readonly lastError = signal<string | null>(null);
  protected readonly lastNavigation = signal<string | null>(null);
  protected readonly isRefreshing = signal(false);

  ngOnInit(): void {
    this.refreshRouteNames();
  }

  protected refreshRouteNames(): void {
    this.routeNames.set(this.namedRouter.getAllRouteNames());
    this.routeExists.set(this.namedRouter.hasRoute(this.routeCheckName()));
  }

  protected async refreshRegistry(): Promise<void> {
    this.lastError.set(null);
    this.isRefreshing.set(true);

    try {
      await this.namedRouteService.refresh();
      this.refreshRouteNames();
    } catch (error) {
      this.lastError.set(this.formatError(error));
    } finally {
      this.isRefreshing.set(false);
    }
  }

  protected checkRoute(): void {
    this.routeExists.set(this.namedRouter.hasRoute(this.routeCheckName()));
  }

  protected previewUrls(): void {
    this.lastError.set(null);

    try {
      const tree = this.namedRouter.createUrlTree('user-detail', {
        routeParams: { id: this.userId() },
        queryParams: { tab: 'profile' }
      });

      this.urlTreePreview.set(this.router.serializeUrl(tree));
      this.urlPreview.set(
        this.namedRouter.serializeUrl('search', {
          routeParams: { query: this.searchQuery() },
          queryParams: { page: 2, tag: ['angular', 'router'] }
        })
      );
    } catch (error) {
      this.lastError.set(this.formatError(error));
    }
  }

  protected async goToUser(): Promise<void> {
    await this.safeNavigate('user-detail', {
      routeParams: { id: this.userId() },
      queryParams: { tab: 'profile' }
    });
  }

  protected async goToSettings(): Promise<void> {
    await this.safeNavigate('user-settings', {
      routeParams: { id: this.userId() },
      replaceUrl: true
    });
  }

  protected async goToSearch(): Promise<void> {
    await this.safeNavigate('search', {
      routeParams: { query: this.searchQuery() },
      queryParams: { source: 'service' }
    });
  }

  protected async goToBroken(): Promise<void> {
    try {
      await this.namedRouter.navigate('missing-route');
      this.lastNavigation.set('Unexpected success navigating to missing-route.');
    } catch (error) {
      this.lastError.set(this.formatError(error));
    }
  }

  private async safeNavigate(routeName: string, extras?: Parameters<NamedRouterService['navigate']>[1]): Promise<void> {
    this.lastError.set(null);
    this.lastNavigation.set(null);

    try {
      const ok = await this.namedRouter.navigate(routeName, extras);
      this.lastNavigation.set(ok ? `Navigation to "${routeName}" succeeded.` : `Navigation to "${routeName}" was canceled.`);
    } catch (error) {
      this.lastError.set(this.formatError(error));
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
