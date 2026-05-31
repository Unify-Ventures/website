import { getFunds, getPortfolios } from "$lib/pocketbase";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch }) => {
    const [portfolios, funds] = await Promise.all([
        getPortfolios(fetch),
        getFunds(fetch),
    ]);

    return { portfolios, funds };
}) satisfies PageServerLoad;
