import PocketBase from "pocketbase";
import {
    Collections,
    type PortfolioCompaniesResponse,
} from "../src/lib/pb-types";
import { optimize } from "svgo";
import addViewBox from "./add-viewbox";
import sharp from "sharp";
import fetch from "node-fetch";
import * as readline from "readline";

const version = "1.2.0";

type OptimiseMetadata = {
    optimise?: {
        processed_with?: string;
    };
};

type ViewBoxData = {
    name: string;
    bbox: string;
};

const pb = new PocketBase(
    process.env.PB_TYPEGEN_URL || "https://content.unifyventures.vc",
);

// Parse command line arguments
const args = process.argv.slice(2);
const viewboxMode = args.includes("--viewbox");

async function authenticateAdmin() {
    const email = process.env.PB_TYPEGEN_EMAIL;
    const password = process.env.PB_TYPEGEN_PASSWORD;
    if (!email || !password) {
        throw new Error("PB_TYPEGEN_EMAIL and PB_TYPEGEN_PASSWORD must be set");
    }
    await pb.admins.authWithPassword(email, password);
    console.log("Authenticated as admin");
}

async function readJsonFromStdin(): Promise<ViewBoxData[]> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log(
        "Please paste the JSON data and press Ctrl+D (or Ctrl+Z on Windows) when done:",
    );

    let input = "";
    for await (const line of rl) {
        input += line + "\n";
    }

    try {
        return JSON.parse(input.trim());
    } catch (error) {
        throw new Error(`Invalid JSON: ${error}`);
    }
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

function extractViewBoxFromSvg(svgContent: string): string | null {
    const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    return viewBoxMatch ? viewBoxMatch[1] : null;
}

function setViewBoxInSvg(svgContent: string, viewBox: string): string {
    let result = svgContent.replace(
        /\s+(?:width|height)\s*=\s*["'][^"']*["']/gi,
        "",
    );

    const hasViewBox = /viewBox\s*=/i.test(result);

    if (hasViewBox) {
        result = result.replace(
            /viewBox\s*=\s*["'][^"']*["']/i,
            `viewBox="${viewBox}"`,
        );
    } else {
        result = result.replace(
            /<svg([^>]*?)>/i,
            `<svg$1 viewBox="${viewBox}">`,
        );
    }

    return result;
}

async function optimizeImage(
    buffer: Buffer,
    filename: string,
    viewBoxData?: string,
): Promise<{ buffer: Buffer; newFilename: string }> {
    const isSvg = filename.toLowerCase().endsWith(".svg");
    if (isSvg) {
        let svgContent = buffer.toString();

        if (viewBoxData) {
            const currentViewBox = extractViewBoxFromSvg(svgContent);
            if (!currentViewBox || currentViewBox !== viewBoxData) {
                console.log(`Setting viewBox to: ${viewBoxData}`);
                svgContent = setViewBoxInSvg(svgContent, viewBoxData);
            } else {
                console.log(`ViewBox already matches: ${viewBoxData}`);
            }
        }

        const result = optimize(svgContent, {
            path: filename,
            plugins: [
                {
                    name: "preset-default",
                },
                addViewBox,
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
    viewBoxMap?: Map<string, string>,
) {
    const metadata = company.metadata || {};
    if (metadata.optimise?.processed_with === version) {
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

        const viewBoxData = viewBoxMap?.get(company.name);
        if (viewBoxData) {
            console.log(`[${company.name}] Found viewBox data: ${viewBoxData}`);
        }

        console.log(`[${company.name}] Optimizing`);
        const { buffer: optimizedBuffer, newFilename } = await optimizeImage(
            imageBuffer,
            sourceFilename,
            viewBoxData,
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
                    processed_with: version,
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
    viewBoxMap?: Map<string, string>,
    batchSize: number = 5,
) {
    for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        await Promise.all(
            batch.map((company) => processCompany(company, viewBoxMap)),
        );
    }
}

async function main() {
    try {
        await authenticateAdmin();

        let viewBoxMap: Map<string, string> | undefined;

        if (viewboxMode) {
            console.log("ViewBox mode enabled - reading JSON from stdin...");
            const viewBoxData = await readJsonFromStdin();
            viewBoxMap = new Map(
                viewBoxData.map((item) => [item.name, item.bbox]),
            );
            console.log(
                `Loaded viewBox data for ${viewBoxMap.size} companies\n`,
            );
        }

        const companies = await pb
            .collection(Collections.PortfolioCompanies)
            .getFullList<
                PortfolioCompaniesResponse<unknown, OptimiseMetadata>
            >();
        console.log(`\nFound ${companies.length} companies\n`);

        await processBatch(companies, viewBoxMap, 5);
        console.log("\nDone!");
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

main();
