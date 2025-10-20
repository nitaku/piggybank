<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeStores, effortsStore } from '$lib/stores';
	import EffortList from './EffortList.svelte';
	import EffortDetail from './EffortDetail.svelte';

	onMount(async () => {
		try {
			await initializeStores();
		} catch (error) {
			console.error('Failed to initialize app:', error);
			// Could show a user-friendly error message here
		}
	});
</script>

<main class="container mx-auto p-4 max-w-md">
	{#if effortsStore.currentEffort}
		<EffortDetail />
	{:else}
		<EffortList />
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>