import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent  {

  
}
