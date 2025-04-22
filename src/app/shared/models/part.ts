import { PartsList } from "./parts-list";
import { Phone } from "./phone";

export class Part {
    id!: number;
    phoneId!: Phone;
    partsListId!: PartsList;
}
