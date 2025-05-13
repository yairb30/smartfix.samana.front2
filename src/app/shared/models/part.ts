import { PartCatalog } from "./part-catalog";
import { Phone } from "./phone";

export class Part {
    id!: number;
    phoneId!: Phone;
    partCatalogId!: PartCatalog;
}
