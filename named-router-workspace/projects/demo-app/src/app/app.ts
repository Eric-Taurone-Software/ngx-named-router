import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NamedRouterLinkDirective } from 'ngx-named-router';

@Component({
  selector: 'app-root',
  imports: [NamedRouterLinkDirective, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly appTitle = 'ngx-named-router demo';
}
