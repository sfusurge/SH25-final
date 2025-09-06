export type QTEConfig = {
    duration: number; // seconds for a full rotation
    count: number;    // number of hotspot centers
    major: number;    // seconds: half-width of the major arc window (total width = 2*major)
    minor: number;    // seconds: additional half-width beyond major for minor window
    majorMod: number; // per-click value to return when hitting major
    minorMod: number; // per-click value to return when hitting minor
    offsetYcqh?: number; // optional extra vertical translate in cqh (positive moves down)
    offsetYcqh640?: number; // optional extra vertical translate for 640px screens
    offsetYcqh400?: number; // optional extra vertical translate for 400px screens
};

export const qteConfigByPlant: Record<string, QTEConfig> = {
    // Monstera
    plant1: {
        duration: 2.5,
        count: 3,
        major: 0.20,
        minor: 0.35,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -14,
        offsetYcqh640: -10,
        offsetYcqh400: -4
    },
    // Vine
    plant2: {
        duration: 3.0,
        count: 3,
        major: 0.18,
        minor: 0.30,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: 8,
        offsetYcqh640: 14,
        offsetYcqh400: 18
    },
    // Tomato
    plant3: {
        duration: 2.2,
        count: 3,
        major: 0.22,
        minor: 0.32,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -25,
        offsetYcqh640: -15,
        offsetYcqh400: -12
    },
    // Staff Stick
    plant4: {
        duration: 2.0,
        count: 3,
        major: 0.25,
        minor: 0.35,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -15,
        offsetYcqh640: -12,
        offsetYcqh400: -8
    },
    // Carrot
    plant5: {
        duration: 1.5,
        count: 3,
        major: 0.18,
        minor: 0.28,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -15,
        offsetYcqh640: -12,
        offsetYcqh400: -8
    },
    // Dandelion
    plant6: {
        duration: 2,
        count: 3,
        major: 0.20,
        minor: 0.30,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -20,
        offsetYcqh640: -12,
        offsetYcqh400: -8
    },
};




