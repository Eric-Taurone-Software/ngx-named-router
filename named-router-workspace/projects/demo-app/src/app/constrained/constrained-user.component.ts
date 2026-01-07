import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-constrained-user',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './constrained-user.component.html',
  styleUrl: './constrained-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstrainedUserComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly userId = computed(() => this.params().get('id'));
}
