import { NamedRoute } from 'ngx-named-router';

import { ConstrainedUserComponent } from './constrained/constrained-user.component';
import { DocsComponent } from './docs/docs.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OptionalUserComponent } from './optional/optional-user.component';
import { SearchComponent } from './search/search.component';
import { UserDetailComponent } from './users/user-detail.component';
import { UserSettingsComponent } from './users/user-settings.component';

export const routes: NamedRoute[] = [
  {
    path: '',
    component: HomeComponent,
    name: 'home'
  },
  {
    path: 'docs',
    component: DocsComponent,
    name: 'docs'
  },
  {
    path: 'users/:id',
    component: UserDetailComponent,
    name: 'user-detail'
  },
  {
    path: 'users/:id/settings',
    component: UserSettingsComponent,
    name: 'user-settings'
  },
  {
    path: 'search/:query',
    component: SearchComponent,
    name: 'search'
  },
  {
    path: 'optional/:id?',
    component: OptionalUserComponent,
    name: 'optional-user'
  },
  {
    path: 'constrained/:id(\\d+)',
    component: ConstrainedUserComponent,
    name: 'user-by-id'
  },
  {
    path: 'products',
    name: 'products',
    loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
