export type FilterDimension<T> = {
    options: T[];
    selected: T | "Any";
};

export type FilterConfig<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K][];
};

export type FilterStore<T extends Record<string, unknown>> = {
    readonly dimensions: { [K in keyof T]: FilterDimension<T[K]> };
    select: <K extends keyof T>(dimension: K, value: T[K] | "Any") => void;
    getAvailableOptions: <K extends keyof T>(dimension: K) => T[K][];
    readonly filteredItems: T[];
    reset: () => void;
};

export function createFilterStore<T extends Record<string, unknown>>(
    items: T[],
    config: FilterConfig<T>,
): FilterStore<T> {
    const dimensions = $state(
        Object.fromEntries(
            Object.entries(config).map(([key, options]) => [
                key,
                { options, selected: "Any" as const },
            ]),
        ) as { [K in keyof T]: FilterDimension<T[K]> },
    );

    function select<K extends keyof T>(
        dimension: K,
        value: T[K] | "Any",
    ): void {
        dimensions[dimension].selected = value;
    }

    function getAvailableOptions<K extends keyof T>(dimension: K): T[K][] {
        const otherDimensions = Object.entries(dimensions)
            .filter(([key]) => key !== dimension)
            .map(([key, dim]) => ({
                key,
                selected: dim.selected,
            }));

        const availableItems = items.filter((item) =>
            otherDimensions.every(
                ({ key, selected }) =>
                    selected === "Any" || item[key] === selected,
            ),
        );

        const possibleValues = [
            ...new Set(availableItems.map((item) => item[dimension])),
        ] as T[K][];

        return config[dimension].filter((option) =>
            possibleValues.includes(option as T[K]),
        );
    }

    const filteredItems = $derived(
        items.filter((item) =>
            Object.entries(dimensions).every(
                ([key, dim]) =>
                    dim.selected === "Any" || item[key] === dim.selected,
            ),
        ),
    );

    function reset(): void {
        Object.keys(dimensions).forEach((key) => {
            dimensions[key as keyof T].selected = "Any";
        });
    }

    return {
        get dimensions() {
            return dimensions;
        },
        select,
        getAvailableOptions,
        get filteredItems() {
            return filteredItems;
        },
        reset,
    };
}
