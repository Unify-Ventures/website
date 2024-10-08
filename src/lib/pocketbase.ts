import PocketBase from "pocketbase";
import {
    Collections,
    type FundsResponse,
    type PortfolioCompaniesResponse,
    type TeamResponse,
    type TypedPocketBase,
} from "./pb-types";

const pb: TypedPocketBase = new PocketBase("https://content.unifyventures.vc");

export const getFeaturedPortfolios = async (
    stage: string = "scaling",
    featured: boolean = true
) => {
    const portfolios = await pb
        .collection("portfolio_companies")
        .getFullList<PortfolioCompaniesResponse<PortfolioExpand>>({
            filter: `${featured ? "featured=true && " : ""}stage='${stage}'`,
            expand: "funds",
        });

    return portfolios;
};

export type PortfolioExpand = {
    funds: FundsResponse[];
};

export const getFileUrl = (
    record: { collectionId: string; id: string },
    name: string
) => {
    return `${pb.buildUrl(
        `/api/files/${record.collectionId}/${record.id}/${name}`
    )}`;
};

export const getTeam = async () => {
    const team = await pb
        .collection(Collections.Team)
        .getFullList<TeamResponse>();

    return team;
};
