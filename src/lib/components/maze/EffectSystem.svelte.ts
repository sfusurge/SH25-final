import type { Player } from "./entities";

export enum EffectId {
    // made trap effects negative for easier debugging lol

    // scroll timed/instant 
    MULTI_SHOT = 1,
    SHIELD = 2,
    HEAL = 3,

    // passive
    SPEED_BOOST = 4,
    RAPID_FIRE = 5,
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
    multiplier?: number; // Multiplier for speed/cooldown/damage/range effects
    value?: number; // Flat value change (healing, damage, stacks, etc.)
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
        id: EffectId.MULTI_SHOT,
        name: "Multi Shot",
        description: "Launch multiple projectiles at once. Stacks for more shots!",
        kind: EffectKind.TIMED,
        defaultDuration: 30,
        icon: "/maze/icons/double-vert.svg",
        stacks: true,
        value: 1, // Each stack adds 1 additional projectile
    },
    {
        id: EffectId.HEAL,
        name: "Healing: +2 Health",
        description: "Restore a portion of your health instantly.",
        kind: EffectKind.INSTANT,
        icon: "/maze/icons/heart.svg",
        stacks: false,
        value: 2, // Amount of health restored
    },
    {
        id: EffectId.SHIELD,
        name: "Shield",
        description: "Gain temporary immunity against incoming damage.",
        kind: EffectKind.TIMED,
        defaultDuration: 5,
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
        value: -0.15, // Base value for diminishing returns formula
    },
    {
        id: EffectId.SPEED_BOOST,
        name: "Fleetfoot",
        description: "Permanently increase your movement speed.",
        kind: EffectKind.PASSIVE,
        icon: "/maze/icons/speed.svg",
        stacks: true,
        value: 0.2, // Base value for diminishing returns formula
    },
    {
        id: EffectId.LONG_RANGE,
        name: "Longshot",
        description: "Permanently extend the range of your projectiles.",
        kind: EffectKind.PASSIVE,
        icon: "/maze/icons/4-pt-star.svg",
        stacks: true,
        value: 0.25, // Base value for diminishing returns formula
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
            defaultDuration: 30,
            icon: "/maze/icons/speed-left.svg",
            stacks: true,
            multiplier: 0.5, // Reduces movement speed to 50%
        },
        {
            id: EffectId.SLOW_SHOOTING,
            name: "Sluggish",
            description: "Your weapon firing rate is severely reduced.",
            kind: EffectKind.TIMED,
            defaultDuration: 30,
            icon: "/maze/icons/double-chevron-left.svg",
            stacks: false,
            multiplier: 2, // Doubles shooting cooldown
        },
        {
            id: EffectId.WEAKENED,
            name: "Weakened",
            description: "Your attack power is reduced.",
            kind: EffectKind.TIMED,
            defaultDuration: 20,
            icon: "/maze/icons/figure-down.svg",
            stacks: false,
            multiplier: 0.5, // Reduces damage to 50%
        },
        {
            id: EffectId.SPIKES,
            name: "Spikes: -1 Health",
            description: "Take instant damage",
            kind: EffectKind.INSTANT,
            icon: "/maze/icons/broken-shield.svg",
            stacks: false,
            value: 1, // Amount of damage dealt
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
    player: Player | null = null;

    constructor(player?: Player) {
        this.definitions = Object.values(EFFECT_DEFINITIONS)
            .flat()
            .reduce((acc, def) => ({ ...acc, [def.id]: def }), {} as Record<EffectId, EffectDefinition>);
        this.player = player ?? null;
    }

    setPlayer(player: Player): void {
        this.player = player;
    }

    reset(): void {
        this.active = [];
        this.lastPickup = null;
        this.currentTimeMs = Date.now();

        // Reset player effect modifiers to default values
        if (this.player) {
            this.player.effectModifiers = {
                moveSpeedMultiplier: 1,
                shootCooldownMultiplier: 1,
                damageMultiplier: 1,
                projectileRangeMultiplier: 1,
                hasShield: false,
                multiShotCount: 1,
            };
        }
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
        }

        this.applyTimed(newEffect);

        return newEffect;
    }

    // Apply an instant effect
    private applyInstant(definition: EffectDefinition): void {
        if (!this.player) {
            return;
        }

        const value = definition.value ?? 0;

        switch (definition.id) {
            case EffectId.HEAL:
                // Restore player health
                this.player.restoreHealth(value);
                break;
            case EffectId.SPIKES:
                // Deal instant damage to player
                this.player.takeDamage(value);
                break;
        }
    }

    // Apply a timed effect
    private applyTimed(effect: ActiveEffect): void {
        if (!this.player) return;
        const def = effect.definition;

        switch (def.id) {
            case EffectId.MULTI_SHOT:
                // Each stack adds value additional projectiles (default 1)
                this.player.effectModifiers.multiShotCount = effect.stacks + (def.value ?? 1);
                break;
            case EffectId.SHIELD:
                this.player.effectModifiers.hasShield = true;
                break;
            case EffectId.SLOW_MOVEMENT:
                this.player.effectModifiers.moveSpeedMultiplier *= (def.multiplier ?? 0.5);
                break;
            case EffectId.SLOW_SHOOTING:
                this.player.effectModifiers.shootCooldownMultiplier *= (def.multiplier ?? 2);
                break;
            case EffectId.WEAKENED:
                this.player.effectModifiers.damageMultiplier *= (def.multiplier ?? 0.5);
                break;
        }
        console.log(`[EffectSystem] Applying timed effect: ${def.name} (stacks: ${effect.stacks})`);
    }

    // Apply or update a passive effect
    // Uses diminishing returns formula: baseValue * log2(stacks + 1)
    private applyPassive(effect: ActiveEffect, previousStacks: number): void {
        if (!this.player) return;
        const def = effect.definition;
        const baseValue = def.value ?? 0;

        const currentScale = Math.log2(effect.stacks + 1);
        const previousScale = previousStacks > 0 ? Math.log2(previousStacks + 1) : 0;
        const scaleDelta = currentScale - previousScale;

        switch (def.id) {
            case EffectId.SPEED_BOOST:
                this.player.effectModifiers.moveSpeedMultiplier += baseValue * scaleDelta;
                break;
            case EffectId.RAPID_FIRE:
                this.player.effectModifiers.shootCooldownMultiplier += baseValue * scaleDelta; // baseValue is negative
                break;
            case EffectId.LONG_RANGE:
                this.player.effectModifiers.projectileRangeMultiplier += baseValue * scaleDelta;
                break;
        }
        console.log(`[EffectSystem] Applying passive effect: ${def.name} (stacks: ${effect.stacks}, scale: ${currentScale.toFixed(2)})`);
    }

    // Remove an effect when it expires.
    private removeTimed(effect: ActiveEffect): void {
        if (!this.player) return;
        const def = effect.definition;

        switch (def.id) {
            case EffectId.MULTI_SHOT:
                this.player.effectModifiers.multiShotCount = 1;
                break;
            case EffectId.SHIELD:
                this.player.effectModifiers.hasShield = false;
                break;
            case EffectId.SLOW_MOVEMENT:
                this.player.effectModifiers.moveSpeedMultiplier /= (def.multiplier ?? 0.5);
                break;
            case EffectId.SLOW_SHOOTING:
                this.player.effectModifiers.shootCooldownMultiplier /= (def.multiplier ?? 2);
                break;
            case EffectId.WEAKENED:
                this.player.effectModifiers.damageMultiplier /= (def.multiplier ?? 0.5);
                break;
        }
    }
}
