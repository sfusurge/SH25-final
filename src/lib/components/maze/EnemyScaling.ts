type StatRecord = Record<string, number>;

export function scaleEnemyStats(
    baseStats: StatRecord,
    level: number,
    scalingConfig: StatRecord = {}
): StatRecord {

    const levelModifier = level - 1;
    const scaled: StatRecord = {};

    for (const propertyName in baseStats) {
        const baseValue = baseStats[propertyName];

        const scalingKey = `${propertyName}PerLevel`;
        const scalingAmount = scalingConfig[scalingKey] ?? 0;

        const scaledValue = baseValue + (scalingAmount * levelModifier);
        scaled[propertyName] = scaledValue;
    }

    return scaled;
}
