class LeafGame {

    // customer and order data
    customer = $state([
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
        { available: true, top: 0, left: 0, order: {} as Record<string, number>, patience: 100 },
    ]);

    // inventory to track deliveries 
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

    //currently selected plant
    pending = $state<string>('');


    constructor() {
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
        this.shop[plant] = true;
        this.inventory[plant] = 10;
    }

    restockPlant(plant: keyof typeof this.inventory) {
        this.inventory[plant] += 10;
    }

    // clicking plant -> set it to pending to be delivered 
    clickPlant(plant: keyof typeof this.inventory) {
        // no effect if inventory <= 0
        if(!(this.inventory[plant] <= 0)){
            return;
        }

        this.pending = plant;
    }

    // index: customer index in the array
    deliverPlant(index: number){
        const customer = this.customer[index];

        // if no pending, no effect
        if(!this.pending){
            return;
        }

        // if pending plant not in order, no effect
        const plant = this.pending;
        if (!(plant in customer.order || customer.order[plant] <= 0)){
            return; 
        }
        
        // todo: 
        // 1. update inventory levels and customer orders
        // 2. check user remaining orders
        // 3. clear pending
    }

}