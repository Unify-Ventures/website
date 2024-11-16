import {
    PortfolioCompaniesStageOptions,
    type PortfolioCompaniesResponse,
} from "./pb-types";
import { getFeaturedPortfolios, type PortfolioExpand } from "./pocketbase";

export const getLinkedInUsername = (url: string) =>
    new URL(url).pathname.split("/").filter(Boolean).pop();

export function createPortfolios() {
    let portfolios = $state<PortfolioCompaniesResponse<PortfolioExpand>[]>([]);
    let portfolioIter = $state(1);

    async function loadPortfolios(
        status: string = "scaling",
        featured: boolean = true
    ) {
        portfolios = await getFeaturedPortfolios(status, featured);
        portfolioIter = 1;

        if (portfolios.length > 4) {
            while (portfolios.length < 20) {
                portfolios.push(...portfolios);
                portfolioIter++;
            }
        }

        return portfolios;
    }

    return {
        loadPortfolios,
        get portfolios() {
            return portfolios;
        },
        get portfolioIter() {
            return portfolioIter;
        },
    };
}

export function getPortfolioCategories() {
    const categories = Object.keys(PortfolioCompaniesStageOptions).map(
        (stage) => {
            return {
                value: stage,
                label: toTitleCase(stage.replace(/_/g, " ")),
            };
        }
    );

    return categories;
}

function toTitleCase(str: string) {
    return str.replace("_", " ").replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
