<script lang="ts">
    import { Button, Radio, Select, PortfolioCard } from "$lib/components/ui";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import { getPortfolios } from "$lib/pocketbase";

    let selectValue = $state("option2");
    let radioValue = $state("option1");

    const selectOptions = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
    ];

    let portfolios = $state<Awaited<ReturnType<typeof getPortfolios>>>([]);

    $effect(() => {
        getPortfolios().then((data) => {
            portfolios = data;
        });
    });

    const demoPortfolio = $derived(
        portfolios[Math.floor(Math.random() * portfolios.length)],
    );
</script>

<main class="p-xl max-w-4xl mx-auto">
    <h1 class="text-title font-bold mb-xl">Design System & Components</h1>

    <!-- Colors -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Colors</h2>
        <div class="flex flex-col gap-md">
            <div>
                <h3 class="text-subtitle font-medium mb-sm">Base Colors</h3>
                <div class="flex gap-md flex-wrap">
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-base border border-neutral"></div>
                        <span class="text-body">base</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-base-alt border border-neutral"></div>
                        <span class="text-body">base-alt</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-muted border border-neutral"></div>
                        <span class="text-body">muted</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-subtitle font-medium mb-sm">Brand Colors</h3>
                <div class="flex gap-md flex-wrap">
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-primary"></div>
                        <span class="text-body">primary</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-primary-hover"></div>
                        <span class="text-body">primary-hover</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-neutral"></div>
                        <span class="text-body">neutral</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-subtitle font-medium mb-sm">Accent Colors</h3>
                <div class="flex gap-md flex-wrap">
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-accent-warning"></div>
                        <span class="text-body">accent-warning</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-accent-success"></div>
                        <span class="text-body">accent-success</span>
                    </div>
                    <div class="flex flex-col gap-sm">
                        <div class="w-24 h-24 bg-accent-info"></div>
                        <span class="text-body">accent-info</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Typography -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Typography</h2>
        <div class="flex flex-col gap-sm">
            <div>
                <span class="text-body text-base-content-muted">text-body</span>
                <p class="text-body">Body text for captions and helper text</p>
            </div>
            <div>
                <span class="text-body text-base-content-muted">text-subtitle</span>
                <p class="text-subtitle">Subtitle for subsection headings</p>
            </div>
            <div>
                <span class="text-body text-base-content-muted">text-heading</span>
                <p class="text-heading">Heading for section titles</p>
            </div>
            <div>
                <span class="text-body text-base-content-muted">text-title</span>
                <p class="text-title">Title for page headings</p>
            </div>
            <div>
                <span class="text-body text-base-content-muted">text-hero</span>
                <p class="text-hero">Hero text</p>
            </div>
        </div>
    </section>

    <!-- Spacing -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Spacing</h2>
        <div class="flex flex-col gap-md">
            <div class="flex items-center gap-md">
                <div class="w-32 text-body">spacing-sm</div>
                <div class="h-8 bg-primary" style="width: var(--spacing-sm)"></div>
                <span class="text-body text-base-content-muted">0.5rem (gap-sm, p-sm)</span>
            </div>
            <div class="flex items-center gap-md">
                <div class="w-32 text-body">spacing-md</div>
                <div class="h-8 bg-primary" style="width: var(--spacing-md)"></div>
                <span class="text-body text-base-content-muted">1rem (gap-md, p-md)</span>
            </div>
            <div class="flex items-center gap-md">
                <div class="w-32 text-body">spacing-lg</div>
                <div class="h-8 bg-primary" style="width: var(--spacing-lg)"></div>
                <span class="text-body text-base-content-muted">3rem (gap-lg, p-lg)</span>
            </div>
        </div>
    </section>

    <!-- Button Variants -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Buttons</h2>
        <div class="flex flex-col gap-md">
            <div class="flex gap-md items-center">
                <Button variant="primary">Primary Button</Button>
                <span class="text-body text-base-content-muted">variant="primary"</span>
            </div>

            <div class="flex gap-md items-center">
                <Button variant="secondary">Secondary Button</Button>
                <span class="text-body text-base-content-muted">variant="secondary"</span>
            </div>

            <div class="flex gap-md items-center">
                <Button variant="ghost">Ghost Button</Button>
                <span class="text-body text-base-content-muted">variant="ghost"</span>
            </div>

            <div class="flex gap-md items-center">
                <Button variant="primary">
                    Button with Icon <ArrowRight />
                </Button>
                <span class="text-body text-base-content-muted">with icon</span>
            </div>

            <div class="flex gap-md items-center">
                <Button variant="primary" href="/portfolio">Link Button</Button>
                <span class="text-body text-base-content-muted">with href prop</span>
            </div>

            <div class="flex gap-md items-center">
                <Button variant="secondary" class="w-full">Full Width</Button>
                <span class="text-body text-base-content-muted">class="w-full"</span>
            </div>
        </div>
    </section>

    <!-- Radio Buttons -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Radio Buttons</h2>
        <div class="flex flex-col gap-sm">
            <p class="text-body text-base-content-muted mb-sm">
                Selected: {radioValue}
            </p>
            <Radio
                value="option1"
                name="demo-radio"
                id="radio-1"
                checked={radioValue === "option1"}
                onchange={() => (radioValue = "option1")}
            >
                {#snippet children()}
                    Option 1
                {/snippet}
            </Radio>

            <Radio
                value="option2"
                name="demo-radio"
                id="radio-2"
                checked={radioValue === "option2"}
                onchange={() => (radioValue = "option2")}
            >
                {#snippet children()}
                    Option 2
                {/snippet}
            </Radio>

            <Radio
                value="option3"
                name="demo-radio"
                id="radio-3"
                checked={radioValue === "option3"}
                onchange={() => (radioValue = "option3")}
            >
                {#snippet children()}
                    Option 3
                {/snippet}
            </Radio>

            <Radio
                value="disabled"
                name="demo-radio"
                id="radio-disabled"
                disabled={true}
                checked={false}
            >
                {#snippet children()}
                    Disabled Option
                {/snippet}
            </Radio>
        </div>
    </section>

    <!-- Select -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Select</h2>
        <div class="flex flex-col gap-md">
            <div class="w-64">
                <Select
                    options={selectOptions}
                    bind:value={selectValue}
                    label="Select an option"
                />
            </div>
            <p class="text-body text-base-content-muted">Selected: {selectValue}</p>

            <div class="w-96">
                <Select
                    options={selectOptions}
                    bind:value={selectValue}
                    label="Custom Width"
                    class="w-full"
                />
            </div>
        </div>
    </section>

    <!-- Portfolio Card -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Portfolio Card</h2>
        {#if demoPortfolio}
            <div class="flex flex-wrap gap-lg">
                <div>
                    <p class="text-body text-base-content-muted mb-sm">
                        With Learn More link
                    </p>
                    <PortfolioCard
                        portfolio={demoPortfolio}
                        href={demoPortfolio.homepage}
                    />
                </div>
                <div>
                    <p class="text-body text-base-content-muted mb-sm">
                        Without Learn More link
                    </p>
                    <PortfolioCard portfolio={demoPortfolio} />
                </div>
            </div>
            <p class="text-body text-base-content-muted mt-md">
                Note: Hover over the cards to see the "Learn More" button slide
                in (only on the first card with href prop)
            </p>
        {:else}
            <p class="text-body text-base-content-muted">Loading portfolio data...</p>
        {/if}
    </section>

    <!-- Real-world Examples -->
    <section class="mb-lg">
        <h2 class="text-heading font-semibold mb-md">Real-world Examples</h2>

        <h3 class="text-subtitle font-medium mb-sm">Example from +page.svelte</h3>
        <div class="flex flex-col gap-md">
            <Button
                variant="primary"
                href="/portfolio"
                class="2xl:hidden flex justify-center items-center"
            >
                See All <ArrowRight />
            </Button>

            <Button
                variant="secondary"
                class="flex flex-row gap-sm justify-center w-max"
                href="https://portal.gxe.com/v/spaces/unify-ventures-syndicate/join/vip"
                target="_blank"
            >
                Join our Syndicate <ArrowRight />
            </Button>
        </div>
    </section>
</main>
