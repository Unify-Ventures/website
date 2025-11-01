import fs from "node:fs";
import path from "node:path";
import { Collections } from "../src/lib/pb-types";
import { getSourceFileUrl, pb } from "../src/lib/pocketbase";
import fetch from "node-fetch";

async function downloadImage(
    record: { collectionId: string; id: string },
    logo: string,
) {
    const f = await fetch(getSourceFileUrl(record, logo));

    const outPath = path.join(
        __dirname,
        "..",
        "static",
        "pb",
        record.collectionId,
        logo,
    );

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, await f.buffer());
}

async function exportPortfolios() {
    try {
        const portfolios = await pb
            .collection(Collections.PortfolioCompanies)
            .getFullList({ expand: "funds.manager" });

        portfolios.forEach(async (p) => {
            downloadImage(p, p.logo);
            if (p.use_unoptimised_logo) downloadImage(p, p.unoptimised_logo);
        });

        const outPath = path.join(
            __dirname,
            "..",
            "static",
            "pb",
            "portfolios.json",
        );
        fs.writeFileSync(outPath, JSON.stringify(portfolios, null, 4));
    } catch (e) {
        console.error(e);
    }
}

async function exportTeam() {
    try {
        const team = await pb.collection(Collections.Team).getFullList();

        fs.writeFileSync(
            path.join(__dirname, "..", "static", "pb", "team.json"),
            JSON.stringify(team, null, 4),
        );

        team.forEach(async (t) => {
            const f = await fetch(getSourceFileUrl(t, t.picture));

            const outPath = path.join(
                __dirname,
                "..",
                "static",
                "pb",
                t.collectionId,
                t.picture,
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
        const funds = await pb
            .collection(Collections.Funds)
            .getFullList({ expand: "manager" });

        fs.writeFileSync(
            path.join(__dirname, "..", "static", "pb", "funds.json"),
            JSON.stringify(funds, null, 4),
        );
    } catch (e) {
        console.error(e);
    }
}

async function exportManagers() {
    try {
        const managers = await pb
            .collection(Collections.Managers)
            .getFullList();

        managers.forEach(async (manager) => {
            const f = await fetch(getSourceFileUrl(manager, manager.logo));

            const outPath = path.join(
                __dirname,
                "..",
                "static",
                "pb",
                manager.collectionId,
                manager.logo,
            );

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, await f.buffer());
        });

        fs.writeFileSync(
            path.join(__dirname, "..", "static", "pb", "managers.json"),
            JSON.stringify(managers, null, 4),
        );
    } catch (e) {
        console.error(e);
    }
}

fs.mkdirSync(path.join(__dirname, "..", "static", "pb"), { recursive: true });
exportPortfolios();
exportTeam();
exportFunds();
exportManagers();
