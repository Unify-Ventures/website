import PocketBase from "pocketbase";
import {
    Collections,
    type FundsResponse,
    type PortfolioCompaniesResponse,
    type TeamResponse,
    type TypedPocketBase,
} from "./pb-types";

export const pb: TypedPocketBase = new PocketBase(
    "https://content.unifyventures.vc"
);

export const getFeaturedPortfolios = async (stage: string = "scaling") => {
    if (process.env.NODE_ENV === "development") {
        const portfolios = await pb
            .collection("portfolio_companies")
            .getFullList<PortfolioCompaniesResponse<PortfolioExpand>>({
                filter: `stage='${stage}'`,
                expand: "funds",
            });

        return portfolios;
    } else {
        let portfolios = (await (
            await fetch("/portfolios.json")
        ).json()) as any[];

        return portfolios.filter((p) => p.stage === stage);
    }
};

export async function getPortfolios(): Promise<
    PortfolioCompaniesResponse<PortfolioExpand>[]
> {
    if (process.env.NODE_ENV === "development") {
        const portfolios = await pb
            .collection("portfolio_companies")
            .getFullList<PortfolioCompaniesResponse<PortfolioExpand>>({
                expand: "funds",
            });

        return portfolios;
    } else {
        let portfolios = (await (
            await fetch("/portfolios.json")
        ).json()) as any[];

        return portfolios;
    }
}

export type PortfolioExpand = {
    funds: FundsResponse[];
};

export const getFileUrl = (
    record: { collectionId: string; id: string },
    name: string
) => {
    if (process.env.NODE_ENV === "development") {
        return `${pb.buildUrl(
            `/api/files/${record.collectionId}/${record.id}/${name}`
        )}`;
    } else {
        return `/pb/${record.collectionId}/${name}`;
    }
};

export const getSourceFileUrl = (
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

    console.log(team);

    return team;
};

export const getFunds = async () => {
    const funds = await pb.collection(Collections.Funds).getFullList({
        filter: "featured=true",
    });

    return funds;
};
