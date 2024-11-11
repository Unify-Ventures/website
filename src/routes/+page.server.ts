import { getFunds } from "$lib/pocketbase";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
    return {
        funds: await getFunds(),
    };
}) satisfies PageServerLoad;
