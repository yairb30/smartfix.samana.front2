import { PartCatalog } from "./part-catalog";
import { Phone } from "./phone";

export class Part {
    id!: number;
    phone!: Phone; 
    partCatalog!: PartCatalog; 
}
