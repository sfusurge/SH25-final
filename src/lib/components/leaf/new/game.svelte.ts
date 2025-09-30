type state = 'idle' | 'running' | 'paused' | 'ended';

class LeafGame {

    gamestate = $state<state>('idle');
    score = $state<number>(0);

    // customer and order data
    customer = $state([
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
    ]);

    // inventory to track deliveries 
    // TODO: in the UI, if inventory: 0, automatically set as OOS
    inventory = $state({
        monstera: 0,
        vine: 0,
        tomato: 0,
        stick: 10,
        carrot: 0,
        dandelion: 0
    });

    // true: unlocked
    shop = $state({
        monstera: false,
        vine: false,
        tomato: false,
        stick: true,
        carrot: false,
        dandelion: false
    })

    // base score for each plant
    baseScore = {
        monstera: 100,
        vine: 3000,
        tomato: 20,
        stick: 5,
        carrot: 99999,
        dandelion: 250
    }

    // score multiplier
    multiplier = {
        monstera: 1,
        vine: 1,
        tomato: 1,
        stick: 1,
        carrot: 1,
        dandelion: 1
    }

    //currently selected plant
    pending = $state<string>('');


    constructor() {

        this.gamestate = "running";
        setInterval(() => {
            this.addOrder();
        }, 2000);
    }

    addOrder() {
        const customer = this.customer.find(c => c.available);
        if (!customer) return;

        const order: Record<string, number> = {};
        const types = 0;
        for (let i = 0; i < 10; i++) {
            // obtain only items that are unlocked 
            if (Math.random() > 0.5) {
                const items = (Object.keys(this.shop) as (keyof typeof this.shop)[]).filter((p) => this.shop[p]);
                const item = this.randItems(items);

                if (order[item]) {
                    order[item] += 1;
                } else {
                    order[item] = 1;
                }
            }
        }
        customer.available = false;
        customer.order = order;
    }


    randItems<T>(arr: T[]): T {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    unlockPlant(plant: keyof typeof this.shop) {
        if (this.gamestate != 'running') {
            return;
        }

        this.shop[plant] = true;
        this.inventory[plant] = 10;
    }

    restockPlant(plant: keyof typeof this.inventory) {
        if (this.gamestate != 'running') {
            return;
        }

        this.inventory[plant] += 10;
    }

    // clicking plant -> set it to pending to be delivered 
    clickPlant(plant: keyof typeof this.inventory) {
        if (this.gamestate != 'running') {
            return;
        }

        if (this.inventory[plant] == 0) {
            return;
        }

        this.pending = plant;
    }

    //index: customer index
    deliverOrder(index: number) {
        if (this.gamestate != 'running') {
            return;
        }

        const cust = this.customer[index];
        if (!cust.available || Object.keys(cust.order).length == 0 || this.pending == '') {
            return;
        }

        const plant = this.pending as keyof typeof this.inventory;
        if (plant && plant in cust.order) {
            cust.order[plant] -= 1;
            // update score
            this.score += this.baseScore[plant] * this.multiplier[plant];
            // inventory
            this.inventory[plant] -= 1;

            if (cust.order[plant] == 0) {
                delete cust.order[plant];
            }

            if (Object.keys(cust.order).length == 0) {
                cust.available = true;
                cust.patience = 100;
            }

            this.pending = '';
        }
    }
}

export const game = new LeafGame();