import { writable, get } from 'svelte/store';
import { plantData } from '$lib/components/leaf/gameData/plantData';
import { bucketData } from '$lib/components/leaf/gameData/bucketData';
import type { QTEConfig } from '$lib/components/leaf/gameData/qteConfig';
import { qteConfigByPlant } from '$lib/components/leaf/gameData/qteConfig';


export type Order = Record<string, number>;
export const scoreStore = writable(0);
export const queuedOrdersStore = writable<Order[]>([]);
export const currentOrderStore = writable<Order>({});

export type GamePhase = 'pre' | 'running' | 'ended';
export const gamePhase = writable<GamePhase>('pre');
export const gameEndsAt = writable<number | null>(null);

// Shop modal state
export const shopOpen = writable<boolean>(false);

export function openShop() {
    shopOpen.set(true);
}

export function closeShop() {
    shopOpen.set(false);
}

// Game pause state
export const gamePaused = writable<boolean>(false);
export const pauseStartTime = writable<number | null>(null);
export const totalPauseTime = writable<number>(0);

export function pauseGame() {
    gamePaused.set(true);
    pauseStartTime.set(Date.now());
    if (game) {
        game.stopTimers();
    }
}

export function resumeGame() {
    const startTime = get(pauseStartTime);
    if (startTime) {
        const pauseDuration = Date.now() - startTime;
        totalPauseTime.update(total => total + pauseDuration);
        pauseStartTime.set(null);

        // Extend all active order expiration times and game session
        if (game) {
            game.extendOrderTimers(pauseDuration);
        }

        // Extend game session end time
        gameEndsAt.update(endsAt => endsAt ? endsAt + pauseDuration : null);
    }

    gamePaused.set(false);
    if (game) {
        game.startTimers();
    }
}

export function toggleGamePause() {
    const currentlyPaused = get(gamePaused);
    if (currentlyPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// Instructions modal state and functions
export const showInstructionsDuringGame = writable<boolean>(false);

export function openInstructions() {
    showInstructionsDuringGame.set(true);
    pauseGame();
}


export enum Stock {
    Default = 'default',
    Available = 'available',
    OutOfStock = 'out_of_stock'
}

export enum OrderStatus {
    InProgress = 'in_progress',
    Success = 'success',
    Fail = 'fail'
}

export type OrderEntity = {
    id: number;
    requestedPlants: Order;
    deliveredPlants: Order;
    status: OrderStatus;
    reward?: number;
    createdAtMs?: number;
    expiresAtMs?: number;
    totalDurationMs?: number;
    hurry?: boolean;
};

export type OrderEntities = Record<number, OrderEntity>;

// Orders queued
export const orderEntities = writable<OrderEntities>({});
// Fixed display slots for up to 3 customers (holds order ids or null)
export const displaySlots = writable<(number | null)[]>([null, null, null]);
// Temp store for selected plant for delivery
export const tempSelectedPlant = writable<string | null>(null); // pending plant key


export type ActiveQTESession = {
    id: string; // unique identifier for this session
    plantKey: string;
    leftPct: string; // percent string e.g. '63%'
    topPct: string;  // percent string e.g. '79%'
    transformCss?: string; // carried-through transform to match plant centering
    config: QTEConfig;
};
export const activeQTESessions = writable<ActiveQTESession[]>([]);


export type ThanksToast = { id: number; amount: number; slotIdx: number; createdAtMs: number };
export const thanksToasts = writable<ThanksToast[]>([]);

// State for plant information during runtime
export type plantInfo = {
    id: number;
    key: string;
    points: number;
    bucketKey: string;
    state: Stock;
    count: number;
    multiplier?: number;
};


const INITIAL_STATES: Record<string, Stock> = {
    bucket1: Stock.Default,
    bucket2: Stock.Default,
    bucket3: Stock.Default,
    bucket4: Stock.Available,
    bucket5: Stock.Default,
    bucket6: Stock.Default,
};

export const plantArray = writable<Record<string, plantInfo>>(
    Object.fromEntries(
        plantData.map((p) => {
            const bucketKey = `bucket${p.id}`;
            const initialState = INITIAL_STATES[bucketKey] ?? Stock.Available;
            return [
                p.key,
                { id: p.id, key: p.key, points: p.points, bucketKey, state: initialState, count: initialState === Stock.Available ? 10 : 0, multiplier: 1 }
            ];
        })
    )
);

export type PlantRuntime = plantInfo;
export const plantsStore = plantArray;


export type MascotFrame = 'default1' | 'default2' | 'success' | 'failure';
export const mascotFrame = writable<MascotFrame>('default1');
export const nowStore = writable<number>(Date.now());


// to control how often timer bars is updated (10 updates/sec)
export const NOW_TICK_MS = 100;
// Default duration for an order before it fails (not yet wired into logic)
export const ORDER_DEFAULT_DURATION_MS = 15_000;
// Threshold ratio at which a customer begins showing an unhappy face (e.g. 0.25 = last 25%)
export const ORDER_HURRY_THRESHOLD_RATIO = 0.25;
// How long a customer (success or failure) should remain before being removed
export const CUSTOMER_REMAIN_IN_SCREEN = 3_000;
// How long the mascot should celebrate success before returning to idle
export const MASCOT_SUCCESS_MS = 3_000;
// How long the mascot should show failure after an order fails
export const MASCOT_FAILURE_MS = 2_000;
// Total session duration (2 minutes)
export const GAME_DURATION_MS = 120_000;

// Rollback boolean
export const ENABLE_QTE = true;

// Local default QTE config fallback (used if plant key missing in qteConfigByPlant)
const DEFAULT_QTE_CONFIG: QTEConfig = {
    duration: 2.5,
    count: 3,
    major: 0.20,
    minor: 0.35,
    majorMod: 1.0,
    minorMod: 1.0,
};

export class LeafGame {
    private orderSeq: number = 1;
    private unlockedKeys: string[] = [];
    private mascotTimerId: number | undefined = undefined;
    private mascotSuccessTimeoutId: number | undefined = undefined;
    private nowTimerId: number | undefined = undefined;
    private orderTimerId: number | undefined = undefined;
    private lastOrderTime: number = Date.now();

    constructor() {
        const plants = Object.values(get(plantArray));
        this.unlockedKeys = plants.filter((p) => p.state === Stock.Available).map((p) => p.key);

        this.orderTimerId = setInterval(() => {
            this.addOrder();
        }, 2000) as unknown as number;

        if (!this.nowTimerId) {
            this.nowTimerId = (setInterval(() => {
                if (!get(gamePaused)) {
                    nowStore.set(Date.now());
                    this.updateTimers();
                    this.checkGameSessionEnd();
                }
            }, NOW_TICK_MS) as unknown) as number;
        }

        this.startMascotIdle();
    }

    addOrder(): void {
        if (get(gamePhase) !== 'running') return;
        if (get(gamePaused)) return;

        this.lastOrderTime = Date.now();

        const slots = get(displaySlots);
        const freeIdx = slots.indexOf(null);
        if (freeIdx === -1) return;

        if (this.unlockedKeys.length === 0) return;

        const items: Order = {};

        const maxTypes = 3;
        const selectedTypes = new Set<string>();

        for (let i = 0; i < 10; i++) {
            if (selectedTypes.size >= maxTypes) break;

            if (Math.random() > 0.4) {
                const item = this.unlockedKeys[Math.floor(Math.random() * this.unlockedKeys.length)];
                if (!selectedTypes.has(item)) {
                    selectedTypes.add(item);
                    items[item] = (items[item] ?? 0) + Math.floor(Math.random() * 3) + 1; // 1-3 of each type
                }
            }
        }

        if (Object.keys(items).length === 0) return;

        const id = this.orderSeq++;
        const entity: OrderEntity = {
            id,
            requestedPlants: items,
            deliveredPlants: {},
            status: OrderStatus.InProgress,
        };

        // Initialize timer fields
        const created = Date.now();
        const totalDuration = ORDER_DEFAULT_DURATION_MS;
        entity.createdAtMs = created;
        entity.totalDurationMs = totalDuration;
        entity.expiresAtMs = created + totalDuration;
        entity.hurry = false;

        // Register entity and place into the free slot
        orderEntities.update((m) => ({ ...m, [id]: entity }));
        displaySlots.update((s) => {
            const next = [...s];
            next[freeIdx] = id;
            return next;
        });
    }


    private startMascotIdle(): void {
        if (this.mascotTimerId) return;

        let lastFrameTime = 0;
        const frameInterval = 700;

        const animateMascot = (currentTime: number) => {
            if (currentTime - lastFrameTime >= frameInterval) {
                let current: MascotFrame = get(mascotFrame);
                if (current === 'success' || current === 'failure') {

                    this.mascotTimerId = requestAnimationFrame(animateMascot) as unknown as number;
                    return;
                }
                mascotFrame.set(current === 'default1' ? 'default2' : 'default1');
                lastFrameTime = currentTime;
            }
            this.mascotTimerId = requestAnimationFrame(animateMascot) as unknown as number;
        };

        this.mascotTimerId = requestAnimationFrame(animateMascot) as unknown as number;
    }


    private updateTimers(): void {
        if (get(gamePaused)) return;

        const now = get(nowStore);
        const toScheduleRemoval: number[] = [];

        orderEntities.update((all) => {
            const next: OrderEntities = { ...all };
            for (const [idStr, order] of Object.entries(all)) {
                const id = Number(idStr);
                if (!order) continue;
                if (order.status !== OrderStatus.InProgress) continue;
                if (order.expiresAtMs == null || order.totalDurationMs == null) continue;

                const msLeft = order.expiresAtMs - now;
                if (msLeft <= 0) {
                    // Queue removal: don't change the list while looping, show briefly, remove once
                    next[id] = { ...order, status: OrderStatus.Fail } as OrderEntity;
                    toScheduleRemoval.push(id);
                    // Show mascot failure
                    this.showMascotFailureFor();
                    continue;
                }

                // Enter hurry state near the end (using adjusted time)
                const threshold = order.totalDurationMs * ORDER_HURRY_THRESHOLD_RATIO;
                if (!order.hurry && msLeft <= threshold) {
                    next[id] = { ...order, hurry: true } as OrderEntity;
                }
            }
            return next;
        });

        // Schedule removals for orders that just failed this tick
        for (const orderId of toScheduleRemoval) {
            setTimeout(() => {
                // remove from entities
                orderEntities.update((inner) => {
                    const copy = { ...inner } as OrderEntities;
                    delete copy[orderId];
                    return copy;
                });
                // clear the slot that held this order
                displaySlots.update((slots) => {
                    const idx = slots.indexOf(orderId);
                    if (idx === -1) return slots;
                    const next = [...slots];
                    next[idx] = null;
                    return next;
                });
            }, CUSTOMER_REMAIN_IN_SCREEN);
        }
    }

    private showMascotSuccessFor(ms: number = MASCOT_SUCCESS_MS): void {
        // Clear any previous success timeout
        if (this.mascotSuccessTimeoutId) {
            clearTimeout(this.mascotSuccessTimeoutId);
            this.mascotSuccessTimeoutId = undefined;
        }
        mascotFrame.set('success');
        this.mascotSuccessTimeoutId = (setTimeout(() => {
            mascotFrame.set('default1');
            this.mascotSuccessTimeoutId = undefined;
        }, ms) as unknown) as number;
    }

    private showMascotFailureFor(ms: number = MASCOT_FAILURE_MS): void {
        if (this.mascotSuccessTimeoutId) {
            clearTimeout(this.mascotSuccessTimeoutId);
            this.mascotSuccessTimeoutId = undefined;
        }
        mascotFrame.set('failure');
        this.mascotSuccessTimeoutId = (setTimeout(() => {
            mascotFrame.set('default1');
            this.mascotSuccessTimeoutId = undefined;
        }, ms) as unknown) as number;
    }


    submitOrder(): void {
        const q = get(queuedOrdersStore);
        if (q.length === 0) return;
        const [target, ...rest] = q;
        queuedOrdersStore.set(rest);

        const co = get(currentOrderStore);
        let gained = 0;
        for (const [key, val] of Object.entries(co)) {
            if (key in target) {
                gained += Math.min(val as number, target[key]!);
            }
        }
        scoreStore.update((s) => s + gained);
        currentOrderStore.set({});
    }

    // Plant Click: select plant for pending delivery 
    plantClick(key: string): void {
        if (get(gamePhase) !== 'running') return;
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.Available) return;
        tempSelectedPlant.set(key);
    }


    deriveQTESessionFor(plantKey: string): ActiveQTESession | null {
        const runtime = get(plantArray)[plantKey];
        const meta = plantData.find((p) => p.key === plantKey);
        if (!runtime || !meta) return null;
        const bucketKey = runtime.bucketKey;
        // Bucket position is percent-based; find by id extracted from bucket key
        const bucketId = Number(bucketKey.replace('bucket', ''));
        // Plant positions are centered relative to the bucket's left/top
        const leftPct = this.getBucketLeftPct(bucketId);
        const topPct = this.getBucketTopPct(bucketId);
        const widthStr = meta.position.width; // like '7%'
        const widthNum = Number(widthStr.replace('%', '')) || 8;
        // Anchor to bucket; shift upward by an estimate of the plant height from its width
        // Convert plant width (% of container width) to an approximate height in cqh using 8/19 aspect ratio
        const approxHeightCqh = (widthNum * 8) / 19; // ~full plant height in cqh
        const cfg = qteConfigByPlant[plantKey] ?? DEFAULT_QTE_CONFIG;
        // Use responsive offset based on screen size
        let extraY = cfg.offsetYcqh ?? 0; // default offset
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width <= 400) {
                extraY = cfg.offsetYcqh400 ?? extraY;
            } else if (width <= 640) {
                extraY = cfg.offsetYcqh640 ?? extraY;
            }
        }
        const transformCss = `translate(-50%, 0) translateY(-${approxHeightCqh - extraY}cqh)`;
        const config = cfg;
        return {
            id: `qte-${plantKey}-${Date.now()}`, // unique identifier
            plantKey,
            leftPct,
            topPct,
            transformCss,
            config
        };
    }



    startQTESession(plantKey: string): boolean {
        const sessions = get(activeQTESessions);

        if (sessions.some(s => s.plantKey === plantKey)) return false;

        const newSession = this.deriveQTESessionFor(plantKey);
        if (newSession) {
            activeQTESessions.update(sessions => [...sessions, newSession]);
            return true;
        }
        return false;
    }

    endQTESession(plantKey: string): void {
        activeQTESessions.update(sessions =>
            sessions.filter(s => s.plantKey !== plantKey)
        );
    }

    recalculateQTEPosition(plantKey: string): ActiveQTESession | null {
        return this.deriveQTESessionFor(plantKey);
    }

    private getBucketLeftPct(bucketId: number): string {
        const bucket = bucketData.find(b => b.id === bucketId);
        if (!bucket) return '50%';

        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

        return isMobile && bucket.mobilePosition
            ? bucket.mobilePosition.left
            : bucket.position.left;
    }

    private getBucketTopPct(bucketId: number): string {
        const bucket = bucketData.find(b => b.id === bucketId);
        if (!bucket) return '50%';


        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;


        return isMobile && bucket.mobilePosition
            ? bucket.mobilePosition.top
            : bucket.position.top;
    }


    deliverPlant(orderId: number): void {
        if (get(gamePhase) !== 'running') return;
        const key = get(tempSelectedPlant);
        if (!key) return;

        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.Available) return;

        orderEntities.update((all) => {
            const order = all[orderId];
            if (!order || order.status !== OrderStatus.InProgress) return all;

            const remaining = order.requestedPlants[key] ?? 0;
            if (remaining <= 0) return all; // not needed for this order

            // Move one unit from requested to delivered
            const newRequested = { ...order.requestedPlants } as Order;
            const newRemaining = remaining - 1;
            if (newRemaining > 0) newRequested[key] = newRemaining; else delete newRequested[key];

            const newDelivered = { ...order.deliveredPlants } as Order;
            newDelivered[key] = (newDelivered[key] ?? 0) + 1;

            const updated: OrderEntity = {
                ...order,
                requestedPlants: newRequested,
                deliveredPlants: newDelivered,
            };

            // Decrement stock; if reaches 0, mark OutOfStock, else keep Available
            const nextCount = Math.max(0, (plant.count ?? 0) - 1);
            const nextState = nextCount === 0 ? Stock.OutOfStock : Stock.Available;
            plantArray.update((m) => ({ ...m, [key]: { ...plant, state: nextState, count: nextCount } }));
            tempSelectedPlant.set(null);

            if (Object.keys(newRequested).length === 0) {
                updated.status = OrderStatus.Success;

                this.showMascotSuccessFor();

                const plantSnapshot = get(plantArray);
                let orderTotal = 0;
                for (const [pKey, cnt] of Object.entries(newDelivered)) {
                    const p = plantSnapshot[pKey];
                    if (!p) continue;
                    const mult = Math.max(0, p.multiplier ?? 1);
                    orderTotal += Math.round(p.points * mult) * (cnt as number);
                }
                // Update score only when order is fully completed
                scoreStore.update((s) => s + orderTotal);
                // Emit thanks toast near this customer slot with the computed order total
                const slotsSnapshot = get(displaySlots);
                const slotIdx = slotsSnapshot.indexOf(orderId);
                if (slotIdx !== -1) {
                    const id = Date.now();
                    thanksToasts.update((arr) => [...arr, { id, amount: orderTotal, slotIdx, createdAtMs: Date.now() }]);
                    setTimeout(() => {
                        thanksToasts.update((arr) => arr.filter((t) => t.id !== id));
                    }, CUSTOMER_REMAIN_IN_SCREEN);
                }

                setTimeout(() => {
                    orderEntities.update((inner) => {
                        const copy = { ...inner } as OrderEntities;
                        delete copy[orderId];
                        return copy;
                    });
                    // clear the slot that held this order
                    displaySlots.update((slots) => {
                        const idx = slots.indexOf(orderId);
                        if (idx === -1) return slots;
                        const next = [...slots];
                        next[idx] = null;
                        return next;
                    });
                }, CUSTOMER_REMAIN_IN_SCREEN);
            }

            return { ...all, [orderId]: updated } as OrderEntities;
        });
    }

    // Restock: Out of Stock -> Available
    restockPlant(key: string): void {
        if (get(gamePhase) !== 'running') return;
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.OutOfStock) return;
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available, count: 10, multiplier: 1 } }));
    }

    // Restock with multiplier persistence
    restockPlantWithMultiplier(key: string, multiplier: number): void {
        if (get(gamePhase) !== 'running') return;
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.OutOfStock) return;
        const safeMult = Number.isFinite(multiplier) ? Math.max(0, multiplier) : 1;
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available, count: 10, multiplier: safeMult } }));
    }

    // Unlock: Default -> Available, cost = plant.points (plant 4 free)
    unlockPlant(key: string): void {
        if (get(gamePhase) !== 'running') return;
        const plant = get(plantArray)[key];
        if (!plant) return;
        if (plant.state !== Stock.Default) return;
        if (plant.id !== 4) {
            const cost = plant.points;
            const currentScore = get(scoreStore);
            if (currentScore < cost) return;
            scoreStore.update((s) => s - cost);
        }
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available, count: 10, multiplier: 1 } }));
        if (!this.unlockedKeys.includes(key)) this.unlockedKeys.push(key);
    }

    // ---- Game session control ----
    startGame(): void {
        // Reset score and clear any existing orders/slots
        scoreStore.set(0);
        orderEntities.set({});
        displaySlots.set([null, null, null]);
        shopOpen.set(false);
        gamePaused.set(false);
        pauseStartTime.set(null);
        totalPauseTime.set(0);
        // Reset all plants to default state, except plant4 which stays available
        const initial = get(plantArray);
        const reset = Object.fromEntries(Object.values(initial).map((p) => {
            const isPlant4 = p.key === 'plant4';
            return [p.key, {
                ...p,
                state: isPlant4 ? Stock.Available : Stock.Default,
                count: isPlant4 ? 10 : 0,
                multiplier: 1
            }];
        }));
        plantArray.set(reset as Record<string, plantInfo>);

        this.unlockedKeys = ['plant4'];

        gamePhase.set('running');
        const ends = Date.now() + GAME_DURATION_MS;
        gameEndsAt.set(ends);
    }

    stopTimers(): void {
        if (this.orderTimerId) {
            clearInterval(this.orderTimerId);
            this.orderTimerId = undefined;
        }
        if (this.nowTimerId) {
            clearInterval(this.nowTimerId);
            this.nowTimerId = undefined;
        }
        if (this.mascotTimerId) {
            cancelAnimationFrame(this.mascotTimerId);
            this.mascotTimerId = undefined;
        }
    }

    startTimers(): void {
        // Restart order timer
        if (!this.orderTimerId) {
            this.orderTimerId = setInterval(() => {
                this.addOrder();
            }, 2000) as unknown as number;
        }

        // Restart now timer
        if (!this.nowTimerId) {
            this.nowTimerId = setInterval(() => {
                if (!get(gamePaused)) {
                    nowStore.set(Date.now());
                    this.updateTimers();
                    this.checkGameSessionEnd();
                }
            }, NOW_TICK_MS) as unknown as number;
        }

        // Restart mascot timer
        this.startMascotIdle();
    }

    extendOrderTimers(pauseDuration: number): void {
        orderEntities.update((all) => {
            const extended: OrderEntities = {};
            for (const [idStr, order] of Object.entries(all)) {
                const id = Number(idStr);
                if (order && order.expiresAtMs) {
                    extended[id] = {
                        ...order,
                        expiresAtMs: order.expiresAtMs + pauseDuration
                    };
                } else {
                    extended[id] = order;
                }
            }
            return extended;
        });
    }

    private checkGameSessionEnd(): void {
        const phase = get(gamePhase);
        if (phase !== 'running') return;
        const endsAt = get(gameEndsAt);
        if (endsAt == null) return;
        if (Date.now() >= endsAt) {
            gamePhase.set('ended');
        }
    }
}

export const game = new LeafGame();
