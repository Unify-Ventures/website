<script lang="ts">
    import Logo from "$lib/components/logo.svelte";
    import { onMount } from "svelte";

    let scrollPosition = 50;
    let isScrollingUp = $state(true);

    onMount(() => {
        window.addEventListener("scroll", () => {
            isScrollingUp =
                document.body.getBoundingClientRect().top > scrollPosition;
            scrollPosition = document.body.getBoundingClientRect().top;
        });
    });

    $effect(() => {
        $inspect(isScrollingUp);
    });
</script>

<nav
    class={"sticky top-0 justify-between items-center bg-white z-20 p-2 transition-all duration-200 w-full"}
    class:-translate-y-full={!isScrollingUp}
>
    <a href="/" aria-label="Home">
        <Logo id="logo" class="w-28 h-min m-2" />
    </a>
</nav>
