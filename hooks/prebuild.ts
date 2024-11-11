import fs from "node:fs";
import path from "node:path";
import { Collections } from "../src/lib/pb-types";
import { getSourceFileUrl, pb } from "../src/lib/pocketbase";
import fetch from "node-fetch";

async function exportPortfolios() {
    try {
        const portfolios = await pb
            .collection(Collections.PortfolioCompanies)
            .getFullList({ expand: "funds" });

        portfolios.forEach(async (p) => {
            const f = await fetch(getSourceFileUrl(p, p.logo));

            const outPath = path.join(
                __dirname,
                "..",
                "static",
                "pb",
                p.collectionId,
                p.logo
            );

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, await f.buffer());
        });

        const outPath = path.join(__dirname, "..", "static", "portfolios.json");
        fs.writeFileSync(outPath, JSON.stringify(portfolios, null, 4));
    } catch (e) {
        console.error(e);
    }
}

async function exportTeam() {
    try {
        const team = await pb.collection(Collections.Team).getFullList();

        team.forEach(async (t) => {
            const f = await fetch(getSourceFileUrl(t, t.picture));

            const outPath = path.join(
                __dirname,
                "..",
                "static",
                "pb",
                t.collectionId,
                t.picture
            );

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, await f.buffer());
        });
    } catch (e) {
        console.error(e);
    }
}

async function exportFunds() {
    try {
        const funds = await pb.collection(Collections.Funds).getFullList();

        funds.forEach(async (fund) => {
            const f = await fetch(getSourceFileUrl(fund, fund.logo));

            const outPath = path.join(
                __dirname,
                "..",
                "static",
                "pb",
                fund.collectionId,
                fund.logo
            );

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, await f.buffer());
        });

        fs.writeFileSync(
            path.join(__dirname, "..", "static", "funds.json"),
            JSON.stringify(funds, null, 4)
        );
    } catch (e) {
        console.error(e);
    }
}

exportPortfolios();
exportTeam();
exportFunds();
