import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebsitesComponent } from './websites/websites.component';
import { WebsiteDetailComponent } from './website-detail/website-detail.component';
import { PageDetailComponent } from './page-detail/page-detail.component';

const routes: Routes = [
  { path: 'websites', component: WebsitesComponent },
  { path: 'website/:id', component: WebsiteDetailComponent },
  { path: 'website/:id/page/:pageId', component: PageDetailComponent },
  { path: '', redirectTo: '/websites', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
