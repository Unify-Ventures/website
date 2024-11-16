<script lang="ts">
    import gsap from "gsap";
    import ScrollTrigger from "gsap/dist/ScrollTrigger";
    import { onMount } from "svelte";
    import Typewriter from "svelte-typewriter";
    import { Select } from "bits-ui";
    import { ChevronsUpDown, ArrowRight, LoaderCircle } from "lucide-svelte";
    import { getFileUrl, getFunds, getTeam } from "$lib/pocketbase";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import { type FundsResponse, type TeamResponse } from "$lib/pb-types";
    import Fa from "svelte-fa";
    import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
    import {
        getLinkedInUsername,
        createPortfolios,
        getPortfolioCategories,
    } from "$lib/page.svelte";
    import type { PageServerData } from "./$types";

    let {
        data,
    }: {
        data: PageServerData;
    } = $props();

    const portfolioStore = createPortfolios();

    let scrollingTl: GSAPTimeline | null = null;

    let teamTl: GSAPTimeline | null = null;

    const portfolioCategories = getPortfolioCategories();

    let team = $state<TeamResponse[]>([]);

    let funds = $state<FundsResponse[]>(data.funds);

    $effect(() => {
        portfolioStore.portfolios; // hack to force svelte to update scrolling carousel
        setupScrolling();
    });

    onMount(async () => {
        await portfolioStore.loadPortfolios();
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
                                        parseFloat(innerText)
                                    )
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            },
                        },
                        ease: config.ease,
                    },
                    0
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
            0
        );
        statTl.counter(
            "#b2b-stat",
            { end: 27, ease: "linear", duration: 1.2 },
            0
        );
        statTl.counter(
            "#fin-stat",
            { end: 12, ease: "linear", duration: 1 },
            0
        );
    });

    function setupScrolling() {
        const portfolioContainer = document.getElementById(
            "portfolio-container"
        );
        const portfolios = document.querySelectorAll(".portfolio");

        scrollingTl = gsap.timeline({
            repeat: -1,
            paused: true,
            onRepeat: () => {
                const firstPortfolio = portfolioContainer?.children[0];

                if (!firstPortfolio) return;

                portfolioContainer?.appendChild(firstPortfolio);
                gsap.set(portfolioContainer, { x: 0 });
            },
        });

        if (portfolioContainer && portfolios.length > 5) {
            scrollingTl.to(portfolios, {
                x: `-=${(portfolios[0] as HTMLElement).offsetWidth + 24}`,
                ease: "linear",
                duration: portfolios.length * 0.25,
            });

            scrollingTl.play();
        }
    }
</script>

<main>
    <h2
        class="2xl:text-7xl text-5xl font-medium lg:mx-16 mx-6 my-10 lg:text-center"
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
            <div class="flex w-full flex-col lg:flex-row gap-12 lg:gap-0">
                {#each funds as fund}
                    <div class="w-full">
                        <svg
                            width="16rem"
                            class="mx-auto"
                            use:inlineSvg={getFileUrl(fund, fund.logo)}
                        />
                    </div>
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

    <section class="flex flex-col justify-center items-center mb-16">
        <div
            class="flex max-w-7xl xl:m-16 m-8 xl:gap-64 lg:gap-36 gap-12 flex-col lg:flex-row items-center justify-center flex-none"
        >
            <h2 class="text-7xl font-medium">Our Portfolio</h2>
            <div class="flex gap-2 flex-col w-64 justify-end">
                <Select.Root
                    selected={portfolioCategories[2]}
                    onSelectedChange={async (obj) => {
                        if (!obj) return;
                        scrollingTl?.kill();
                        portfolioStore.portfolios.length = 0; // reset portfolios. this is allowed by ECMAScript
                        await portfolioStore.loadPortfolios(obj.value, false);
                    }}
                >
                    <Select.Trigger
                        class="border-2 p-4 border-zinc-900 hover:bg-zinc-100 transition-all duration-200 cursor-pointer inline-flex gap-2"
                        aria-label="Select a category"
                    >
                        <Select.Value placeholder="Select a category" />
                        <ChevronsUpDown class="ml-auto" />
                    </Select.Trigger>
                    <Select.Content
                        sameWidth
                        overlap
                        sideOffset={-3}
                        class="border-2 border-zinc-900 bg-white flex flex-col gap-2"
                    >
                        {#each portfolioCategories as category}
                            <Select.Item
                                value={category.value}
                                class="p-4 hover:bg-zinc-100 transition-all duration-200 cursor-pointer"
                            >
                                {category.label}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <a
                    href="/portfolio"
                    class="2xl:hidden flex justify-center items-center bg-zinc-900 text-white p-4"
                >
                    See All <ArrowRight />
                </a>
            </div>
        </div>
        <div class="flex flex-row gap-2">
            <div
                class={`overflow-hidden max-w-[100vw] 2xl:max-w-6xl`}
                id="scroll-container"
            >
                <div
                    class="w-full flex flex-row gap-6"
                    id="portfolio-container"
                >
                    {#each portfolioStore.portfolios as portfolio}
                        <div
                            class={`w-40 md:w-64 aspect-square bg-zinc-100 portfolio relative group text-zinc-800 ${
                                portfolio.invert_foreground
                                    ? "hover:[&:not(.no-hover)]:text-zinc-100"
                                    : ""
                            }`}
                            style:--accent={portfolio.accent}
                            onmouseenter={(e) => {
                                scrollingTl?.pause();
                            }}
                            onmouseleave={(e) => {
                                if (portfolioStore.portfolios.length > 5) {
                                    scrollingTl?.play();
                                }
                            }}
                            role="img"
                        >
                            <div
                                role="img"
                                class="w-40 md:w-64 aspect-square flex justify-center items-center p-6 xl:p-12 transition-colors duration-150"
                                id={`portfolio-${portfolio.id}-${portfolioStore.portfolioIter}`}
                            >
                                <svg
                                    use:inlineSvg={getFileUrl(
                                        portfolio,
                                        portfolio.logo
                                    )}
                                    width="100%"
                                />
                            </div>
                            {#if portfolio.expand?.funds[0]?.logo}
                                <svg
                                    use:inlineSvg={getFileUrl(
                                        portfolio.expand.funds[0],
                                        portfolio.expand.funds[0].logo
                                    )}
                                    class="p-2 h-12 max-w-28 text-zinc-900 bg-zinc-200 absolute bottom-0 right-0 translate-y-0 group-hover:translate-y-full transition-all duration-150"
                                ></svg>
                            {/if}
                            <button
                                class="flex flex-row gap-2 bg-zinc-900 p-4 text-white absolute bottom-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-150"
                            >
                                Learn More <ArrowRight />
                            </button>
                        </div>
                    {:else}
                        <p
                            class="text-6xl h-64 flex gap-6 items-center justify-center w-full"
                        >
                            <LoaderCircle class="animate-spin" size="64" /> Loading
                            portfolios...
                        </p>
                    {/each}
                </div>
            </div>
            <div class="hidden 2xl:block relative">
                <div
                    class="absolute top-0 left-0 bottom-0 -translate-x-full bg-gradient-to-r from-transparent via-white/75 to-white w-44 transition-all duration-150 shadow-effect"
                ></div>
                <a
                    href="/portfolio/"
                    class="flex justify-center items-center bg-zinc-900 text-white w-64 h-64 text-2xl gap-2 hover:bg-zinc-800 duration-150 transition-all"
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
                class="flex flex-col lg:flex-row lg:space-between gap-16 flex-wrap justify-center"
            >
                {#each team as member, i}
                    <div
                        class="flex flex-col items-center gap-2 group 2xl:w-96 2xl:h-96"
                        id={"member-" + member.id}
                    >
                        <div
                            class="flex 2xl:flex-row items-center gap-4 w-64 group-hover:w-max transition-all duration-300 flex-col 2xl:mr-auto"
                        >
                            <a
                                href={member.linkedin}
                                target="_blank"
                                class="relative flex-none pointer-events-none 2xl:pointer-events-auto"
                            >
                                <img
                                    src={getFileUrl(member, member.picture)}
                                    alt={`${member.name}'s avatar`}
                                    class="w-64 h-64 m-auto aspect-square 2xl:group-hover:w-24 2xl:group-hover:h-24 rounded-none 2xl:group-hover:rounded-[50%] object-cover transition-all duration-300"
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
                                            0.25 * i
                                        );
                                    }}
                                />
                                <div
                                    class="hidden 2xl:block absolute bottom-0 right-0 p-1 rounded-full bg-zinc-200 scale-0 group-hover:scale-100 transition-all duration-300"
                                >
                                    <Fa size="lg" icon={faLinkedin} />
                                </div>
                            </a>
                            <div
                                class="flex 2xl:scale-50 2xl:-translate-x-32 flex-col gap-1 2xl:opacity-0 2xl:translate-y-10 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300"
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
                            class="2xl:max-w-sm max-w-64 p-2 text-justify 2xl:scale-75 2xl:-translate-y-8 2xl:opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300"
                        >
                            {member.blurb}
                        </p>

                        <a
                            href={member.linkedin}
                            target="_blank"
                            class="flex flex-row 2xl:hidden items-center gap-2"
                        >
                            <Fa size="lg" icon={faLinkedin} />
                            <span>{getLinkedInUsername(member.linkedin)}</span>
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    </section>
</main>

<style>
    :root {
        --cursor-width: 0.2rem;
    }

    .portfolio:hover:not(.no-hover) > div {
        background-color: var(--accent);
        transition: all 150ms ease;
    }

    .section-wrapper {
        padding: 4rem; /* Adjust as necessary */
    }
</style>
