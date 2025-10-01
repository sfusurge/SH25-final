export enum EffectId {
    // made trap effects negative for easier debugging lol

    // scroll
    DOUBLE_SHOT = 1,
    RAPID_FIRE = 2,
    HEAL = 3,
    SPEED_BOOST = 4,
    SHIELD = 5,
    LONG_RANGE = 6,

    // trap
    SLOW_MOVEMENT = -1,
    SLOW_SHOOTING = -2,
    SPIKES = -3,
    WEAKENED = -4,
}


export enum EffectKind {
    INSTANT = 0,
    TIMED = 1,
    PASSIVE = 2,
}

export enum EffectSource {
    SCROLL_TIMED = 0,
    SCROLL_PASSIVE = 1,
    TRAP = 2,
}

// Metadata describing an effect type.
export interface EffectDefinition {
    id: EffectId;
    name: string;
    description: string;
    kind: EffectKind;
    defaultDuration?: number; // Only for timed effects
    icon?: string;
    stacks?: boolean; // If true, effect can stack
}

export interface EffectPickup {
    definition: EffectDefinition;
    source: EffectSource;
    timestampMs: number;
}

export interface ActiveEffect {
    id: EffectId;
    definition: EffectDefinition;
    startedAtMs: number;
    stacks: number;
    remainingDuration: number | null; // null for instant
    totalDuration: number | null;
}

const SCROLL_TIMED_EFFECTS: EffectDefinition[] = [
    {
        id: EffectId.DOUBLE_SHOT,
        name: "Double Shot",
        description: "Launch two projectiles at once for a short time.",
        kind: EffectKind.TIMED,
        defaultDuration: 18,
        icon: "/maze/icons/double-vert.svg",
        stacks: false,
    },
    {
        id: EffectId.HEAL,
        name: "Healing Scroll",
        description: "Restore a portion of your health instantly.",
        kind: EffectKind.INSTANT,
        icon: "/maze/icons/heart.svg",
        stacks: false,
    },
    {
        id: EffectId.SHIELD,
        name: "Shield",
        description: "Gain temporary immunity against incoming damage.",
        kind: EffectKind.TIMED,
        defaultDuration: 8,
        icon: "/maze/icons/shield.svg",
        stacks: false,
    },
];

const SCROLL_PASSIVE_EFFECTS: EffectDefinition[] = [
    {
        id: EffectId.RAPID_FIRE,
        name: "Rapid Fire",
        description: "Permanently reduce your firing cooldown.",
        kind: EffectKind.PASSIVE,
        icon: "/maze/icons/double-chevron.svg",
        stacks: true,
    },
    {
        id: EffectId.SPEED_BOOST,
        name: "Fleetfoot",
        description: "Permanently increase your movement speed.",
        kind: EffectKind.PASSIVE,
        icon: "/maze/icons/speed.svg",
        stacks: true,
    },
    {
        id: EffectId.LONG_RANGE,
        name: "Longshot",
        description: "Permanently extend the range of your projectiles.",
        kind: EffectKind.PASSIVE,
        icon: "/maze/icons/4-pt-star.svg",
        stacks: true,
    },
];

const EFFECT_DEFINITIONS: Record<EffectSource, EffectDefinition[]> = {
    [EffectSource.SCROLL_TIMED]: SCROLL_TIMED_EFFECTS,
    [EffectSource.SCROLL_PASSIVE]: SCROLL_PASSIVE_EFFECTS,
    [EffectSource.TRAP]: [
        {
            id: EffectId.SLOW_MOVEMENT,
            name: "Burdened",
            description: "Your movement speed is drastically reduced.",
            kind: EffectKind.TIMED,
            defaultDuration: 15,
            icon: "/maze/icons/speed-left.svg",
            stacks: true,
        },
        {
            id: EffectId.SLOW_SHOOTING,
            name: "Sluggish",
            description: "Your weapon firing rate is severely reduced.",
            kind: EffectKind.TIMED,
            defaultDuration: 12,
            icon: "/maze/icons/double-chevron-left.svg",
            stacks: false,
        },
        {
            id: EffectId.WEAKENED,
            name: "Weakened",
            description: "Your attack power is reduced.",
            kind: EffectKind.TIMED,
            defaultDuration: 8,
            icon: "/maze/icons/figure-down.svg",
            stacks: false,
        },
        {
            id: EffectId.SPIKES,
            name: "Spike Trap",
            description: "Take instant damage",
            kind: EffectKind.INSTANT,
            icon: "/maze/icons/broken-shield.svg",
            stacks: false,
        },
    ],
};

export function getEffectPool(source: EffectSource): EffectDefinition[] {
    return EFFECT_DEFINITIONS[source] ?? [];
}

export class EffectSystem {
    definitions: Record<EffectId, EffectDefinition>;
    currentTimeMs = $state(Date.now());
    active = $state<ActiveEffect[]>([]);
    lastPickup = $state<EffectPickup | null>(null);

    constructor() {
        this.definitions = Object.values(EFFECT_DEFINITIONS)
            .flat()
            .reduce((acc, def) => ({ ...acc, [def.id]: def }), {} as Record<EffectId, EffectDefinition>);
    }

    reset(): void {
        this.active = [];
        this.lastPickup = null;
        this.currentTimeMs = Date.now();
    }

    update(dt: number): void {
        if (!Number.isFinite(dt) || dt <= 0) return;

        this.currentTimeMs += dt * 1000;
        if (!this.active.length) return;

        this.active = this.active
            .map(effect => ({
                ...effect,
                remainingDuration: effect.remainingDuration === null
                    ? null
                    : Math.max(0, effect.remainingDuration - dt)
            }))
            .filter(effect => {
                if (effect.remainingDuration === null || effect.remainingDuration > 0) return true;
                this.removeTimed(effect);
                return false;
            });
    }

    // Grant a random effect from the specified source
    grantRandomEffect(source: EffectSource): EffectDefinition | null {
        const candidates = EFFECT_DEFINITIONS[source];

        if (!candidates?.length) return null;

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.grantEffect(chosen.id, { source });
        return chosen;
    }

    // Grant a specific effect by ID
    grantEffect(id: EffectId, options?: { source?: EffectSource }): ActiveEffect | null {
        const definition = this.definitions[id];
        if (!definition) return null;

        const source = options?.source ?? EffectSource.SCROLL_TIMED;
        this.lastPickup = { definition, source, timestampMs: this.currentTimeMs };

        if (definition.kind === EffectKind.INSTANT) {
            this.applyInstant(definition);
            return null;
        }

        const existingIndex = this.active.findIndex(active => active.id === id);

        if (definition.kind === EffectKind.PASSIVE) {
            const previousStacks = existingIndex >= 0 ? this.active[existingIndex].stacks : 0;
            const nextStacks = definition.stacks
                ? previousStacks + 1
                : Math.max(previousStacks, 1);

            const updatedEffect: ActiveEffect = {
                id,
                definition,
                startedAtMs: this.currentTimeMs,
                stacks: nextStacks || 1,
                remainingDuration: null,
                totalDuration: null,
            };

            if (existingIndex >= 0) {
                this.active[existingIndex] = updatedEffect;
                this.applyPassive(updatedEffect, previousStacks);
            } else {
                this.active = [...this.active, updatedEffect];
                this.applyPassive(updatedEffect, 0);
            }

            return updatedEffect;
        }

        const duration = definition.defaultDuration ?? null;

        const newEffect: ActiveEffect = {
            id,
            definition,
            startedAtMs: this.currentTimeMs,
            stacks: existingIndex >= 0 && definition.stacks
                ? this.active[existingIndex].stacks + 1
                : 1,
            remainingDuration: duration,
            totalDuration: duration,
        };

        if (existingIndex >= 0) {
            this.active[existingIndex] = newEffect;
        } else {
            this.active = [...this.active, newEffect];
            this.applyTimed(newEffect);
        }

        return newEffect;
    }

    // Apply an instant effect
    private applyInstant(definition: EffectDefinition): void {
        // TODO: Implement effect dispatch once player modifiers are wired up.
    }

    // Apply a timed effect
    private applyTimed(effect: ActiveEffect): void {
        // TODO: Attach modifiers (movement, shooting, etc.) to the player instance.
    }

    // Apply or update a passive effect
    private applyPassive(effect: ActiveEffect, previousStacks: number): void {
        // TODO: Apply permanent modifiers (movement, range, fire rate) to the player instance.
        // previousStacks can be used to adjust incremental bonuses when stacking.
    }

    // Remove an effect when it expires.
    private removeTimed(effect: ActiveEffect): void {
        // TODO: Remove applied modifiers once they are implemented.
    }
}
