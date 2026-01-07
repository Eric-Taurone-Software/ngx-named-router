import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly query = computed(() => this.params().get('query'));
  protected readonly page = computed(() => this.queryParams().get('page'));
  protected readonly tag = computed(() => this.queryParams().getAll('tag').join(', '));
  protected readonly source = computed(() => this.queryParams().get('source'));
}
