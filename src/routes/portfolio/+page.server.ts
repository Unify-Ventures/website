import { getFunds, getPortfolios } from "$lib/pocketbase";
import { PortfolioCompaniesCategoryOptions } from "$lib/pb-types";
import type { PageServerLoad } from "./$types";

function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
}

export const load = (async ({ fetch }) => {
    const [portfolios, funds] = await Promise.all([
        getPortfolios(fetch),
        getFunds(fetch),
    ]);

    const used = new Set(
        portfolios.map(
            (p) => p.category ?? PortfolioCompaniesCategoryOptions.Unassigned,
        ),
    );
    const categories: {
        value: "Any" | PortfolioCompaniesCategoryOptions;
        label: string;
    }[] = [
        { value: "Any", label: "Any" },
        ...Object.values(PortfolioCompaniesCategoryOptions)
            .filter((c) => used.has(c))
            .map((c) => ({
                value: c,
                label: toTitleCase(c.replace(/_/g, " ")),
            })),
    ];

    return { portfolios, funds, categories };
}) satisfies PageServerLoad;
