import PocketBase from "pocketbase";
import {
    Collections,
    type PortfolioCompaniesResponse,
} from "../src/lib/pb-types";
import { hexToHsl } from "../src/lib/color-utils";

type AutoInvertMetadata = {
    auto_invert?: {
        processed_with?: string;
    };
};

const pb = new PocketBase(
    process.env.PB_TYPEGEN_URL || "https://content.unifyventures.vc",
);

async function authenticateAdmin() {
    const email = process.env.PB_TYPEGEN_EMAIL;
    const password = process.env.PB_TYPEGEN_PASSWORD;

    if (!email || !password) {
        throw new Error("PB_TYPEGEN_EMAIL and PB_TYPEGEN_PASSWORD must be set");
    }

    await pb.admins.authWithPassword(email, password);
    console.log("Authenticated as admin");
}

async function processCompany(
    company: PortfolioCompaniesResponse<unknown, AutoInvertMetadata>,
) {
    const metadata = company.metadata || {};

    if (metadata.auto_invert?.processed_with === "1.0.1") {
        console.log(`[${company.name}] Already processed, skipping`);
        return;
    }

    try {
        await pb.collection(Collections.PortfolioCompanies).update(company.id, {
            invert_foreground: hexToHsl(company.accent)[2] <= 65,
            metadata: {
                ...metadata,
                auto_invert: {
                    processed_with: "1.0.1",
                },
            },
        });

        console.log(`[${company.name}] Completed`);
    } catch (error: unknown) {
        console.error(`[${company.name}] Failed`);
        const err = error as {
            response?: { data?: unknown };
            message?: string;
        };
        if (err.response?.data) {
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message || error);
        }
    }
}

async function processBatch(
    companies: PortfolioCompaniesResponse<unknown, AutoInvertMetadata>[],
    batchSize: number = 5,
) {
    for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        await Promise.all(batch.map((company) => processCompany(company)));
    }
}

async function main() {
    try {
        await authenticateAdmin();

        const companies = await pb
            .collection(Collections.PortfolioCompanies)
            .getFullList<
                PortfolioCompaniesResponse<unknown, AutoInvertMetadata>
            >({
                filter: 'logo ~ "%.svg"',
            });

        console.log(`\nFound ${companies.length} companies\n`);

        await processBatch(companies, 5);

        console.log("\nDone!");
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

main();
