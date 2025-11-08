import { getFileUrl, getManagers, getPortfolios } from "$lib/pocketbase";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
    return {
        managers: await getManagers(),
        portfolioLogos: (await getPortfolios())
            .map((p) => {
                return p.use_unoptimised_logo
                    ? [
                          { p: p, l: p.logo },
                          { p: p, l: p.unoptimised_logo },
                      ]
                    : [{ p: p, l: p.logo }];
            })
            .flat()
            .map((l) => getFileUrl(l.p, l.l)),
    };
}) satisfies PageServerLoad;
