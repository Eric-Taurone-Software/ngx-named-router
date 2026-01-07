import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponent {}
