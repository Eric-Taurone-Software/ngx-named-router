import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
