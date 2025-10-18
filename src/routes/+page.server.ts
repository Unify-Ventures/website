import { getManagers } from "$lib/pocketbase";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
    return {
        managers: await getManagers(),
    };
}) satisfies PageServerLoad;
