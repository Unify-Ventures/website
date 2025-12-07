<script lang="ts">
    import gsap from "gsap";
    import ScrollTrigger from "gsap/dist/ScrollTrigger";
    import { onMount } from "svelte";
    import Typewriter from "svelte-typewriter";
    import { Label, Select } from "bits-ui";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import {
        getFileUrl,
        getPortfolios,
        getTeam,
        type PortfolioExpand,
    } from "$lib/pocketbase";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import {
        type ManagersResponse,
        type PortfolioCompaniesResponse,
        type TeamResponse,
    } from "$lib/pb-types";
    import Fa from "svelte-fa";
    import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
    import {
        getLinkedInUsername,
        createPortfolios,
        getPortfolioCategories,
    } from "$lib/page.svelte";
    import type { PageServerData } from "./$types";
    import InfiniteCarousel from "$lib/components/InfiniteCarousel.svelte";
    import PortfolioDialog from "$lib/components/PortfolioDialog.svelte";

    let {
        data,
    }: {
        data: PageServerData;
    } = $props();

    const portfolioStore = createPortfolios();

    let portfolios = $state<
        PortfolioCompaniesResponse<unknown, unknown, PortfolioExpand>[]
    >([]);

    let teamTl: GSAPTimeline | null = null;

    let externalPause = $state(false);

    const portfolioCategories = getPortfolioCategories();

    let team = $state<TeamResponse[]>([]);

    let managers = $derived(data.managers);

    let portfolioSelectValue = $state(portfolioCategories[2].value);

    const selectedLabel = $derived(
        portfolioCategories.find((c) => c.value === portfolioSelectValue)
            ?.label ?? "All Categories",
    );

    let selectedPortfolio = $state<PortfolioCompaniesResponse<
        unknown,
        unknown,
        PortfolioExpand
    > | null>(null);
    let portfolioDialog = $state<HTMLDialogElement | undefined>(undefined);

    onMount(async () => {
        await portfolioStore.loadPortfolios();
        portfolios = await getPortfolios();
        team = await getTeam();
    });

    onMount(() => {
        gsap.registerEffect({
            name: "counter",
            extendTimeline: true,
            defaults: {
                end: 0,
                duration: 0.5,
                ease: "power1",
                increment: 1,
            },
            effect: (targets: HTMLElement[], config: any) => {
                let tl = gsap.timeline();
                const num = targets[0].innerText.replace(/\,/g, "");
                targets[0].innerText = num;

                tl.to(
                    targets,
                    {
                        duration: config.duration,
                        innerText: config.end,
                        modifiers: {
                            innerText: (innerText: string) => {
                                return gsap.utils
                                    .snap(
                                        config.increment,
                                        parseFloat(innerText),
                                    )
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            },
                        },
                        ease: config.ease,
                    },
                    0,
                );

                return tl;
            },
        });

        gsap.registerPlugin(ScrollTrigger);
    });

    onMount(() => {
        const statTl = gsap
            .timeline({
                scrollTrigger: {
                    trigger: "#partner-stat",
                },
            })
            .pause();

        statTl.counter(
            "#partner-stat",
            { end: 3, ease: "linear", duration: 0.6 },
            0,
        );
        statTl.counter(
            "#b2b-stat",
            { end: 27, ease: "linear", duration: 1.2 },
            0,
        );
        statTl.counter(
            "#fin-stat",
            { end: 12, ease: "linear", duration: 1 },
            0,
        );
    });
</script>

<svelte:head>
    <!-- Prefetch portfolio and portfolio company logos -->
    <link rel="prefetch" href="/portfolio" />
    {#each data.portfolioLogos as logo}
        <link rel="prefetch" href={logo} />
    {/each}
</svelte:head>

<main>
    <h2
        class="mx-6 my-10 text-5xl font-medium lg:mx-16 lg:text-center 2xl:text-7xl"
    >
        <span>
            We invest in thematic funds across,
            <Typewriter mode="loop">
                <span>B2B SaaS.</span>
                <span>Advanced Manufacturing.</span>
                <span>Fin Tech.</span>
            </Typewriter>
        </span>
    </h2>

    <section class="section">
        <div>
            <h2>Unify Fund of Funds</h2>
            <p>
                Unify Ventures has established a multi-thematic fund of funds
                that invests in managers covering B2B SaaS, Advanced
                Manufacturing, and Fin Tech, with more thematics to come.
            </p>
            <div
                class="flex w-full flex-row flex-wrap items-center justify-center gap-12"
            >
                {#each managers as manager}
                    <a
                        onmouseenter={(e) => {
                            if (!(e.target instanceof HTMLElement)) return;
                            e.target.style.color = manager.accent;
                        }}
                        onmouseleave={(e) => {
                            if (!(e.target instanceof HTMLElement)) return;
                            e.target.style.removeProperty("color");
                        }}
                        href={manager.homepage}
                        target="_blank"
                        aria-label={`Fund manager: ${manager.name}`}
                    >
                        <svg
                            width="16rem"
                            use:inlineSvg={getFileUrl(manager, manager.logo)}
                        />
                    </a>
                {/each}
            </div>
        </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3">
        <div id="stat1" class="bg-amber-400 p-16">
            <h3 class="text-2xl">Partner Funds</h3>
            <span id="partner-stat" class="text-9xl">1</span>
        </div>
        <div id="stat2" class="bg-stone-400 p-16">
            <h3 class="text-2xl">B2B SaaS</h3>
            <span id="b2b-stat" class="text-9xl">1</span><span class="text-9xl"
                >+</span
            >
        </div>
        <div id="stat3" class="bg-emerald-400 p-16">
            <h3 class="text-2xl">Fin Tech</h3>
            <span id="fin-stat" class="text-9xl">1</span><span class="text-9xl"
                >+</span
            >
        </div>
    </section>

    <section class="mb-16 flex flex-col items-center justify-center">
        <div
            class="m-8 flex max-w-7xl flex-none flex-col items-center justify-center gap-12 lg:flex-row lg:gap-36 xl:m-16 xl:gap-64"
        >
            <h2 class="text-7xl font-medium">Our Portfolio</h2>
            <div class="flex w-64 flex-col justify-end gap-2">
                <Select.Root
                    type="single"
                    bind:value={portfolioSelectValue}
                    onValueChange={(v) => {
                        console.log(v);
                        portfolioStore.portfolios.length = 0;
                        portfolioStore.loadPortfolios(v, false);
                    }}
                >
                    <Select.Trigger
                        class="inline-flex cursor-pointer gap-2 border-2 border-zinc-900 p-4 transition-all duration-200 hover:bg-zinc-100"
                        aria-label="Select a category"
                    >
                        {selectedLabel}
                        <ChevronsUpDown class="ml-auto" />
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            sideOffset={-3}
                            class="z-10 w-64 border-2 border-zinc-900 bg-white"
                        >
                            <Select.ScrollUpButton
                                class="flex w-full items-center justify-center py-1"
                            >
                                <ChevronsUpDown class="size-3" />
                            </Select.ScrollUpButton>
                            <Select.Viewport class="flex flex-col gap-2 p-2">
                                {#each portfolioCategories as category}
                                    <Select.Item
                                        value={category.value}
                                        label={category.label}
                                        class="cursor-pointer p-4 transition-all duration-200 hover:bg-zinc-100"
                                    >
                                        {#snippet children({ selected })}
                                            {category.label}
                                        {/snippet}
                                    </Select.Item>
                                {/each}
                            </Select.Viewport>
                            <Select.ScrollDownButton
                                class="flex w-full items-center justify-center py-1"
                            >
                                <ChevronsUpDown class="size-3" />
                            </Select.ScrollDownButton>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
                <a
                    href="/portfolio"
                    class="flex items-center justify-center bg-zinc-900 p-4 text-white 2xl:hidden"
                >
                    See All <ArrowRight />
                </a>
            </div>
        </div>
        <div class="flex flex-row gap-2">
            {#if portfolioStore.portfolios.length > 0}
                <InfiniteCarousel
                    class="max-w-[100vw] 2xl:max-w-6xl"
                    trackClass="gap-6"
                    speed={60}
                    gap={24}
                    {externalPause}
                >
                    {#each portfolioStore.portfolios as portfolio}
                        <button
                            class={`portfolio group relative aspect-square w-40 bg-zinc-100 text-zinc-800 md:w-64 ${
                                portfolio.invert_foreground
                                    ? "hover:[&:not(.no-hover)]:text-zinc-100"
                                    : ""
                            }`}
                            style:--accent={portfolio.accent}
                            aria-label="View {portfolio.name} portfolio"
                            onclick={() => {
                                selectedPortfolio = portfolio;
                                externalPause = true;
                                portfolioDialog?.showModal();
                            }}
                        >
                            <div
                                role="img"
                                class="flex aspect-square w-40 items-center justify-center p-6 transition-colors duration-150 md:w-64 xl:p-12"
                                class:no-hover={!portfolio.logo.endsWith(
                                    ".svg",
                                )}
                                id={`portfolio-${portfolio.id}`}
                            >
                                {#if portfolio.logo.endsWith(".svg")}
                                    <svg
                                        width="100%"
                                        height="100%"
                                        use:inlineSvg={getFileUrl(
                                            portfolio,
                                            !portfolio.use_unoptimised_logo
                                                ? portfolio.logo
                                                : portfolio.unoptimised_logo,
                                        )}
                                    />
                                {:else}
                                    <img
                                        class={"h-full w-full object-contain" +
                                            (portfolio.invert_foreground
                                                ? " contrast-75 hue-rotate-180 invert"
                                                : "")}
                                        width="100%"
                                        height="100%"
                                        src={getFileUrl(
                                            portfolio,
                                            !portfolio.use_unoptimised_logo
                                                ? portfolio.logo
                                                : portfolio.unoptimised_logo,
                                        )}
                                        alt={`${portfolio.name}'s logo'`}
                                    />
                                {/if}
                            </div>
                            {#if portfolio.expand?.funds?.[0]?.expand?.manager?.logo}
                                <svg
                                    use:inlineSvg={getFileUrl(
                                        portfolio.expand.funds[0].expand
                                            .manager,
                                        portfolio.expand.funds[0].expand.manager
                                            .logo,
                                    )}
                                    class="absolute right-0 bottom-0 h-12 max-w-28 translate-y-0 bg-zinc-200 p-2 text-zinc-900 transition-all duration-150 group-hover:translate-y-full"
                                ></svg>
                            {/if}
                            <div
                                class="absolute right-0 bottom-0 flex translate-y-full flex-row gap-2 bg-zinc-900 p-4 text-white transition-all duration-150 group-hover:translate-y-0"
                            >
                                Learn More <ArrowRight />
                            </div>
                        </button>
                    {/each}
                </InfiniteCarousel>
            {:else}
                <div class="max-w-[100vw] overflow-hidden 2xl:max-w-6xl">
                    <p
                        class="flex h-64 w-full items-center justify-center gap-6 text-6xl"
                    >
                        <LoaderCircle class="animate-spin" size="64" /> Loading portfolios...
                    </p>
                </div>
            {/if}
            <div class="relative hidden 2xl:block">
                <!-- <div
                    class="absolute top-0 left-0 bottom-0 -translate-x-full bg-linear-to-r from-transparent via-white/75 to-white w-44 transition-all duration-150 shadow-effect"
                ></div> -->
                <a
                    href="/portfolio/"
                    class="flex h-64 w-64 items-center justify-center gap-2 bg-zinc-900 text-2xl text-white transition-all duration-150 hover:bg-zinc-800"
                >
                    See All <ArrowRight />
                </a>
            </div>
        </div>
    </section>

    <section class="section">
        <div>
            <h2>Our Team</h2>
            <div
                class="lg:space-between flex flex-col flex-wrap justify-center gap-16 lg:flex-row"
            >
                {#each team as member, i}
                    <div
                        class="group flex flex-col items-center gap-2 2xl:h-96 2xl:w-96"
                        id={"member-" + member.id}
                    >
                        <div
                            class="flex w-64 flex-col items-center gap-4 transition-all duration-300 group-hover:w-max 2xl:mr-auto 2xl:flex-row"
                        >
                            <a
                                href={member.linkedin}
                                target="_blank"
                                class="pointer-events-none relative flex-none 2xl:pointer-events-auto"
                            >
                                <img
                                    src={getFileUrl(member, member.picture)}
                                    alt={`${member.name}'s avatar`}
                                    class="m-auto aspect-square h-64 w-64 rounded-none object-cover transition-all duration-300 2xl:group-hover:h-24 2xl:group-hover:w-24 2xl:group-hover:rounded-[50%]"
                                    onload={() => {
                                        if (i == 0) {
                                            teamTl = gsap.timeline({
                                                scrollTrigger: {
                                                    trigger:
                                                        "#member-" + member.id,
                                                },
                                            });
                                        }

                                        if (!teamTl) return;
                                        teamTl.from(
                                            "#member-" + member.id,
                                            {
                                                opacity: 0,
                                                y: 100,
                                                duration: 1,
                                            },
                                            0.25 * i,
                                        );
                                    }}
                                />
                                <div
                                    class="absolute right-0 bottom-0 hidden scale-0 rounded-full bg-zinc-200 p-1 transition-all duration-300 group-hover:scale-100 2xl:block"
                                >
                                    <Fa size="lg" icon={faLinkedin} />
                                </div>
                            </a>
                            <div
                                class="flex flex-col gap-1 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 2xl:-translate-x-32 2xl:translate-y-10 2xl:scale-50 2xl:opacity-0"
                            >
                                <h3 class="text-3xl font-medium">
                                    {member.name}
                                </h3>
                                <h4 class="text-xl text-zinc-700">
                                    {member.title}
                                </h4>
                            </div>
                        </div>

                        <p
                            class="max-w-64 p-2 text-justify transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 2xl:max-w-sm 2xl:-translate-y-8 2xl:scale-75 2xl:opacity-0"
                        >
                            {member.blurb}
                        </p>

                        <a
                            href={member.linkedin}
                            target="_blank"
                            class="flex flex-row items-center gap-2 2xl:hidden"
                        >
                            <Fa size="lg" icon={faLinkedin} />
                            <span>{getLinkedInUsername(member.linkedin)}</span>
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <section class="section">
        <div>
            <h2>Invest with Us</h2>
            <div class="flex flex-col gap-6">
                <p>
                    As a Fund of Funds with an underlying portfolio of {portfolios.length >
                    0
                        ? portfolios.length
                        : "<loading>"}
                    startups and a broad network of VCs, Family Offices and Venture
                    Partners across Australia, we offer our LPs preferential access
                    to co-investments through the Unify Syndicate. We take a patient,
                    focused approach with two key strategies: hard-to-access startups
                    that have demonstrated revenue momentum with a clear path to exit,
                    and selective stakes in our partner funds on the rare occasions
                    they become available. Image
                </p>
                <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {#each [{ key: "Deals", value: 4 }, { key: "Capital Raised", value: "$865,000" }, { key: "Average Deal Size", value: "$216,250" }] as stat}
                        <div>
                            <p class="text-black/75">{stat.key}</p>
                            <span class="text-6xl font-light">{stat.value}</span
                            >
                        </div>
                    {/each}
                </div>
                <a
                    href="https://portal.gxe.com/v/spaces/unify-ventures-syndicate/join/vip"
                    class="mt-6 flex w-max flex-row justify-center gap-2 border-2 border-zinc-900 bg-zinc-900 p-2 text-white transition-all duration-200 hover:bg-zinc-100 hover:text-black"
                    target="_blank"
                >
                    Join our Syndicate <ArrowRight />
                </a>
            </div>
        </div>
    </section>
</main>

<PortfolioDialog
    portfolio={selectedPortfolio}
    logos={portfolios.map((p) => ({
        logoURL: getFileUrl(
            p,
            !p.use_unoptimised_logo ? p.logo : p.unoptimised_logo,
        ),
        portfolio: p,
    }))}
    bind:dialogElement={portfolioDialog}
    onclose={() => {
        externalPause = false;
    }}
/>

<style>
    :root {
        --cursor-width: 0.2rem;
    }

    .portfolio:hover:not(.no-hover) > div[role="img"] {
        background-color: var(--accent);
        transition: all 150ms ease;
    }

    .section-wrapper {
        padding: 4rem; /* Adjust as necessary */
    }
</style>
