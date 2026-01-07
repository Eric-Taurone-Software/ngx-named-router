import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly userId = computed(() => this.params().get('id') as string);
  protected readonly tab = computed(() => this.queryParams().get('tab'));
  protected readonly source = computed(() => this.queryParams().get('source'));
}
