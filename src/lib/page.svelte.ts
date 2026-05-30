import {
    PortfolioCompaniesStageOptions,
    type PortfolioCompaniesResponse,
} from "./pb-types";
import { getFeaturedPortfolios, type PortfolioExpand } from "./pocketbase";

import { SvelteURL } from "svelte/reactivity";

export const getLinkedInUsername = (url: string) =>
    new SvelteURL(url).pathname.split("/").filter(Boolean).pop();

export function createPortfolios() {
    let portfolios = $state<
        PortfolioCompaniesResponse<unknown, unknown, PortfolioExpand>[]
    >([]);

    async function loadPortfolios(stage: string) {
        portfolios = await getFeaturedPortfolios(stage);
        return portfolios;
    }

    return {
        loadPortfolios,
        get portfolios() {
            return portfolios;
        },
    };
}

export function getPortfolioStages() {
    const stages = Object.keys(PortfolioCompaniesStageOptions).map((stage) => {
        return {
            value: stage,
            label: toTitleCase(stage.replace(/_/g, " ")),
        };
    });

    return stages;
}

function toTitleCase(str: string) {
    return str.replace("_", " ").replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
