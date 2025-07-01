import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  sidebarVisible = false;

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Cerrar sidebar cuando se hace clic en un link (solo en móvil)
  onNavLinkClick(): void {
    if (window.innerWidth < 768) {
      this.sidebarVisible = false;
    }
  }
}
