<script lang="ts">
    import Logo from "$lib/components/logo.svelte";
</script>

<nav
    class={"z-20 w-full items-center justify-between bg-white p-2 transition-all duration-200"}
>
    <a href="/" aria-label="Home">
        <Logo id="logo" class="m-2 h-min w-28" />
    </a>
</nav>
