import { NamedRoute } from 'ngx-named-router';

import { ProductDetailComponent } from './product-detail.component';
import { ProductListComponent } from './product-list.component';

export const PRODUCTS_ROUTES: NamedRoute[] = [
  {
    path: '',
    component: ProductListComponent,
    name: 'product-list'
  },
  {
    path: ':id',
    component: ProductDetailComponent,
    name: 'product-detail'
  }
];
