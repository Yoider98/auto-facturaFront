import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { FacturaService } from "./services/factura.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit  {
  isAuthRoute = false;
  isReady = false;

  ngOnInit() {
    this.facturaService.getMasterList().subscribe();
    this.facturaService.getActivoFijo().subscribe();
  }

  constructor(private router: Router, private facturaService: FacturaService) {
    
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthRoute =
          event.url.startsWith("/dashboard") || event.url.startsWith("/404");
        this.isReady = true;
      }
    });
  }

  isAuthenticated(): boolean {
    // Aquí iría tu lógica de autenticación
    return !!localStorage.getItem("token");
  }

  logout(): void {
    localStorage.removeItem("token");
    this.router.navigate(["/auth"]);
  }
}
