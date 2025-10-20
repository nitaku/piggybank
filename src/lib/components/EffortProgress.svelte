<script lang="ts">
	import { effortsStore, entriesStore, categoriesStore } from '$lib/stores.svelte';
	import { formatCurrency } from '$lib/currency';

	interface Props {
		effortId: number;
		showTotal?: boolean;
	}

	let { effortId, showTotal = false }: Props = $props();

	const getTotalSaved = (): number => {
		return entriesStore.entries
			.filter(entry => entry.effortId === effortId)
			.reduce((total, entry) => total + entry.amount, 0);
	};

	const getProgressPercentage = (): number => {
		const effort = effortsStore.efforts.find(e => e.id === effortId);
		if (!effort?.targetAmount) return 100; // Show full bar for no target
		const total = getTotalSaved();
		return Math.min((total / effort.targetAmount) * 100, 100);
	};

	const getSavingsByCategory = (): { category: string; amount: number; color: string; percentage: number }[] => {
		const effortEntries = entriesStore.entries.filter(entry => entry.effortId === effortId);
		const categoryTotals: { [key: string]: { amount: number; color: string } } = {};

		// Calculate total savings per category
		effortEntries.forEach(entry => {
			if (!categoryTotals[entry.category]) {
				const category = categoriesStore.categories.find(c => c.id === entry.category);
				categoryTotals[entry.category] = { amount: 0, color: category?.color || '#666' };
			}
			categoryTotals[entry.category].amount += entry.amount;
		});

		const totalSavings = getTotalSaved();
		const effort = effortsStore.efforts.find(e => e.id === effortId);
		const targetAmount = effort?.targetAmount || totalSavings;

		// Convert to array with percentages relative to target amount
		const progressPercentage = getProgressPercentage();
		return Object.entries(categoryTotals).map(([category, data]) => ({
			category,
			amount: data.amount,
			color: data.color,
			percentage: progressPercentage > 0 ? (data.amount / totalSavings) * progressPercentage : 0
		})).filter(item => item.percentage > 0);
	};
</script>

{#if showTotal}
	<div class="flex justify-center items-center mb-2">
		<span class="text-sm">
			{formatCurrency(getTotalSaved())}
			{#if effortsStore.efforts.find(e => e.id === effortId)?.targetAmount}
				/ {formatCurrency(effortsStore.efforts.find(e => e.id === effortId)?.targetAmount ?? 0)}
			{/if}
		</span>
	</div>
{/if}
<div class="w-full bg-base-200 rounded-full h-3 overflow-hidden flex">
	{#each getSavingsByCategory() as categoryData}
		<div
			class="h-full"
			style="flex: {categoryData.percentage}; background-color: {categoryData.color};"
			title="{categoryData.category}: {formatCurrency(categoryData.amount)} ({Math.round(categoryData.percentage)}%)"
		></div>
	{/each}
	{#if getTotalSaved() < (effortsStore.efforts.find(e => e.id === effortId)?.targetAmount || 0)}
		<div class="h-full" style="flex: {100 - getProgressPercentage()}; background-color: transparent;"></div>
	{:else if getTotalSaved() === 0 && !effortsStore.efforts.find(e => e.id === effortId)?.targetAmount}
		<div class="h-full" style="flex: 100; background-color: transparent;"></div>
	{/if}
</div>
<div class="text-xs text-base-content/70 mt-1">
	{#if effortsStore.efforts.find(e => e.id === effortId)?.targetAmount}
		{Math.round(getProgressPercentage())}% complete
	{/if}
</div>
{#if getSavingsByCategory().length > 0}
	<div class="flex flex-wrap gap-2 mt-2">
		{#each getSavingsByCategory() as categoryData}
			<div class="flex items-center gap-1 text-xs">
				<div class="w-2 h-2 rounded-full" style="background-color: {categoryData.color};"></div>
				<span class="capitalize">{categoryData.category}</span>
				<span class="text-base-content/70">{formatCurrency(categoryData.amount)}</span>
			</div>
		{/each}
	</div>
{/if}