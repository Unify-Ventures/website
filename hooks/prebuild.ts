import fs from "node:fs";
import path from "node:path";
import PocketBase from "pocketbase";
import { Collections } from "../src/lib/pb-types";

const pocketbaseURL = process.env.PB_TYPEGEN_URL;

if (!pocketbaseURL) {
    throw new Error("POCKETBASE_URL must be set");
}

const pocketbase = new PocketBase(pocketbaseURL);

async function exportPortfolios() {
    try {
        const portfolios = await pocketbase
            .collection(Collections.PortfolioCompanies)
            .getFullList();
        const outPath = path.join(__dirname, "..", "static", "portfolios.json");
        fs.writeFileSync(outPath, JSON.stringify(portfolios, null, 4));
    } catch (e) {
        console.error(e);
    }
}

exportPortfolios();
