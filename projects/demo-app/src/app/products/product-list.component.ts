import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NamedRouterLinkDirective } from 'ngx-named-router';

interface ProductPreview {
  id: string;
  name: string;
  price: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NamedRouterLinkDirective],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  protected readonly products: ProductPreview[] = [
    { id: 'p-100', name: 'Starter Kit', price: '$29' },
    { id: 'p-200', name: 'Pro Toolkit', price: '$89' },
    { id: 'p-300', name: 'Enterprise Suite', price: '$199' }
  ];
}
