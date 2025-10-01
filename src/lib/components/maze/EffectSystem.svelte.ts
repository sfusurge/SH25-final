export enum EffectId {
    // made trap effects negative for easier debugging lol

    // scroll
    DOUBLE_SHOT = 1,
    RAPID_FIRE = 2,
    HEAL = 3,
    SPEED_BOOST = 4,
    SHIELD = 5,

    // trap
    SLOW_MOVEMENT = -1,
    SLOW_SHOOTING = -2,
    SPIKES = -3,
    WEAKENED = -4,
}


export enum EffectKind {
    INSTANT = 0,
    TIMED = 1,
    PASSIVE = 2 // not used, but just in case?
}

export enum EffectSource {
    SCROLL = 0,
    TRAP = 1,
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

const EFFECT_DEFINITIONS: Record<EffectSource, EffectDefinition[]> = {
    [EffectSource.SCROLL]: [
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
            id: EffectId.RAPID_FIRE,
            name: "Rapid Fire",
            description: "Reduce your firing cooldown dramatically.",
            kind: EffectKind.TIMED,
            defaultDuration: 12,
            icon: "/maze/icons/double-chevron.svg",
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
            id: EffectId.SPEED_BOOST,
            name: "Haste",
            description: "Boost your movement speed for a limited time.",
            kind: EffectKind.TIMED,
            defaultDuration: 10,
            icon: "/maze/icons/speed.svg",
            stacks: true,
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
    ],
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

        if (!candidates.length) return null;

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.grantEffect(chosen.id, { source });
        return chosen;
    }

    // Grant a specific effect by ID
    grantEffect(id: EffectId, options?: { source?: EffectSource }): ActiveEffect | null {
        const definition = this.definitions[id];
        if (!definition) return null;

        const source = options?.source ?? EffectSource.SCROLL;
        this.lastPickup = { definition, source, timestampMs: this.currentTimeMs };

        if (definition.kind === EffectKind.INSTANT) {
            this.applyInstant(definition);
            return null;
        }

        const duration = definition.defaultDuration ?? null;
        const existingIndex = this.active.findIndex(active => active.id === id);

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

    // Remove an effect when it expires.
    private removeTimed(effect: ActiveEffect): void {
        // TODO: Remove applied modifiers once they are implemented.
    }
}
