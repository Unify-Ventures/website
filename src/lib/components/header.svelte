<script lang="ts">
    import Logo from "$lib/components/logo.svelte";
    import { onMount } from "svelte";
</script>

<nav
    class={"justify-between items-center bg-white z-20 p-2 transition-all duration-200 w-full"}
>
    <a href="/" aria-label="Home">
        <Logo id="logo" class="w-28 h-min m-2" />
    </a>
</nav>
