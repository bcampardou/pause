import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlyrModule } from '../shared/plyr/public_api';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { PopoverModule } from 'ngx-smart-popover';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    SharedModule, 
    HomeRoutingModule, 
    PopoverModule,
    PlyrModule
  ]
})
export class HomeModule {}
