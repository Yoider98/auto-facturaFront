import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
//import { AuthGuard } from "../core/guards/auth.guard";
import { SubirArchivoComponent } from "./pages/subirArchivo/subirArchivo.component";
import { ListaFacturasComponent } from "./pages/factura/lista-facturas/lista-facturas.component";
import { FacturasGeneradasComponent } from './pages/factura/facturas-generadas/facturas-generadas.component';

const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    //canActivate: [AuthGuard], // Protege el acceso al Dashboard
    children: [
      {
        path: "facturas",
        component: ListaFacturasComponent,
        //canActivate: [AuthGuard],
      },
      {
        path: "subirArchivo",
        component: SubirArchivoComponent,
        //canActivate: [AuthGuard], // Protege también los usuarios
      },
      {
        path: "facturas-generadas",
        component: FacturasGeneradasComponent,
        //canActivate: [AuthGuard],
      },
      { path: "", redirectTo: "facturas", pathMatch: "full" }, // Ruta por defecto
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
