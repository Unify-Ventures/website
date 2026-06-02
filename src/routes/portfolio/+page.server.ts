import { getFunds, getPortfolios } from "$lib/pocketbase";
import { PortfolioCompaniesCategoryOptions } from "$lib/pb-types";
import type { PageServerLoad } from "./$types";

function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
}

type FundExpand = { manager?: { name?: string; featured?: boolean } };

export const load = (async ({ fetch }) => {
    const [portfolios, rawFunds] = await Promise.all([
        getPortfolios(fetch),
        getFunds(fetch),
    ]);

    const usedCategorySet = new Set(
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
            .filter((c) => usedCategorySet.has(c))
            .map((c) => ({
                value: c,
                label: toTitleCase(c.replace(/_/g, " ")),
            })),
    ];

    const usedFundIds = new Set(portfolios.flatMap((p) => p.funds ?? []));
    const funds: {
        value: string;
        label: string;
        managerName: string;
        managerFeatured: boolean;
    }[] = [
        { value: "Any", label: "Any", managerName: "", managerFeatured: false },
        ...rawFunds
            .filter((f) => usedFundIds.has(f.id))
            .sort((a, b) => {
                const aExpand = a.expand as FundExpand | undefined;
                const bExpand = b.expand as FundExpand | undefined;
                const aFeatured = aExpand?.manager?.featured ?? false;
                const bFeatured = bExpand?.manager?.featured ?? false;

                if (aFeatured !== bFeatured) return bFeatured ? 1 : -1;

                const aName = aExpand?.manager?.name ?? "";
                const bName = bExpand?.manager?.name ?? "";
                return aName.localeCompare(bName);
            })
            .map((fund) => {
                const expand = fund.expand as FundExpand | undefined;
                return {
                    value: fund.id,
                    label: fund.short_name || fund.name,
                    managerName: expand?.manager?.name ?? "",
                    managerFeatured: expand?.manager?.featured ?? false,
                };
            }),
    ];

    return { portfolios, funds, categories };
}) satisfies PageServerLoad;
