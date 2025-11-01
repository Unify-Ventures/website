import PocketBase from "pocketbase";
import {
    Collections,
    type PortfolioCompaniesResponse,
} from "../src/lib/pb-types";
import { optimize } from "svgo";
import sharp from "sharp";
import fetch from "node-fetch";

type OptimiseMetadata = {
    optimise?: {
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

async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

function getFileUrl(
    record: { collectionId: string; id: string },
    filename: string,
): string {
    return pb.buildUrl(
        `/api/files/${record.collectionId}/${record.id}/${filename}`,
    );
}

async function optimizeImage(
    buffer: Buffer,
    filename: string,
): Promise<{ buffer: Buffer; newFilename: string }> {
    const isSvg = filename.toLowerCase().endsWith(".svg");

    if (isSvg) {
        const result = optimize(buffer.toString(), {
            path: filename,
            plugins: [
                {
                    name: "preset-default",
                },
            ],
        });
        return {
            buffer: Buffer.from(result.data),
            newFilename: filename,
        };
    } else {
        const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        const newFilename = filename.replace(/\.[^.]+$/, ".webp");
        return {
            buffer: optimized,
            newFilename,
        };
    }
}

async function processCompany(
    company: PortfolioCompaniesResponse<unknown, OptimiseMetadata>,
) {
    const metadata = company.metadata || {};

    if (metadata.optimise?.processed_with === "1.0.0") {
        console.log(`[${company.name}] Already processed, skipping`);
        return;
    }

    try {
        let sourceFilename = company.unoptimised_logo;

        if (!sourceFilename) {
            console.log(`[${company.name}] Migrating logo to unoptimised_logo`);
            sourceFilename = company.logo;
            const logoUrl = getFileUrl(company, sourceFilename);
            const logoBuffer = await downloadImage(logoUrl);
            const logoFile = new File(
                [new Uint8Array(logoBuffer)],
                sourceFilename,
            );

            await pb
                .collection(Collections.PortfolioCompanies)
                .update(company.id, {
                    unoptimised_logo: logoFile,
                });
        }

        const sourceUrl = getFileUrl(company, sourceFilename);
        console.log(`[${company.name}] Downloading ${sourceFilename}`);
        const imageBuffer = await downloadImage(sourceUrl);

        console.log(`[${company.name}] Optimizing`);
        const { buffer: optimizedBuffer, newFilename } = await optimizeImage(
            imageBuffer,
            sourceFilename,
        );

        console.log(`[${company.name}] Uploading ${newFilename}`);
        const file = new File([new Uint8Array(optimizedBuffer)], newFilename, {
            type: newFilename.endsWith(".svg") ? "image/svg+xml" : "image/webp",
        });

        await pb.collection(Collections.PortfolioCompanies).update(company.id, {
            logo: file,
            metadata: {
                ...metadata,
                optimise: {
                    processed_with: "1.0.0",
                },
            },
        });

        console.log(`[${company.name}] Completed`);
    } catch (error: any) {
        console.error(`[${company.name}] Failed`);
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message || error);
        }
    }
}

async function processBatch(
    companies: PortfolioCompaniesResponse<unknown, OptimiseMetadata>[],
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
                PortfolioCompaniesResponse<unknown, OptimiseMetadata>
            >();

        console.log(`\nFound ${companies.length} companies\n`);

        await processBatch(companies, 5);

        console.log("\nDone!");
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

main();
