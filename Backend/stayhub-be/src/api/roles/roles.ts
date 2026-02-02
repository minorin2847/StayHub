export default class Role {
    name: string;
    tier: number;

    constructor({ name, tier }: {
        name: string;
        tier: number;
    }) {
        this.name = name;
        this.tier = tier;
    }

    
}