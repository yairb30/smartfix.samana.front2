import { Client } from "./client";
import { Phone } from "./phone";

export class Repair {
    id!: number;
    clientId!: Client;
    phoneId!: Phone;
    problem!: string;
    state!: string;
    date!: Date;
}
