import { Routes } from "@angular/router";
import { PartListComponent } from "./components/part-list/part-list.component";
import { PartFormComponent } from "./components/part-form/part-form.component";

export const partsRoutes: Routes = [
    {path: '', component: PartListComponent},
    {path: 'new', component: PartFormComponent},
    {path: 'edit/:id', component: PartFormComponent},
]