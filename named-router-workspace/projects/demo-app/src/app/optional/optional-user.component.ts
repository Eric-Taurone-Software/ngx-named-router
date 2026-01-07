import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-optional-user',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './optional-user.component.html',
  styleUrl: './optional-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionalUserComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly userId = computed(() => this.params().get('id'));
}
