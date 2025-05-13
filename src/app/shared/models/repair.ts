
import { Customer } from "./customer";
import { Phone } from "./phone";

export class Repair {
    id!: number;
    customerId!: Customer;
    phoneId!: Phone;
    problem!: string;
    state!: string;
    date!: Date;
}
