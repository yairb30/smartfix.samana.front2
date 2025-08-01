
import { Customer } from "./customer";
import { Phone } from "./phone";

export class Repair {
    id!: number;
    customer!: Customer; 
    phone!: Phone;
    fault!: string;
    state!: string;
    date!: Date;
}
