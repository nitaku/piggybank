<script lang="ts">
	import { effortsStore, entriesStore, categoriesStore } from '$lib/stores.svelte';
	import type { SavingsEntry } from '$lib/types';
	import { Utensils, Plane, DollarSign, Tag } from 'lucide-svelte';

	let newEntryAmount = $state('');
	let newEntryCategory = $state('');
	let newEntryDescription = $state('');
	let formErrors = $state<{ amount?: string; category?: string }>({});

	const goBack = () => {
		effortsStore.setCurrentEffort(null);
	};

	const validateForm = (): boolean => {
		formErrors = {};
		let isValid = true;

		if (!newEntryAmount.toString().trim()) {
			formErrors.amount = 'Amount is required';
			isValid = false;
		} else {
			const amount = parseFloat(newEntryAmount);
			if (isNaN(amount) || amount <= 0) {
				formErrors.amount = 'Please enter a valid positive amount';
				isValid = false;
			}
		}

		if (!newEntryCategory) {
			formErrors.category = 'Please select a category';
			isValid = false;
		}

		return isValid;
	};

	const addEntry = () => {
		if (!validateForm() || !effortsStore.currentEffort) return;

		try {
			const category = categoriesStore.categories.find(c => c.id === newEntryCategory);
			if (!category) return;

			const entry: Omit<SavingsEntry, 'id'> = {
				effortId: effortsStore.currentEffort.id,
				amount: parseFloat(newEntryAmount),
				category: newEntryCategory,
				categoryColor: category.color,
				icon: category.icon,
				description: newEntryDescription.trim() || undefined,
				createdAt: new Date()
			};

			entriesStore.createEntry(entry);

			// Reset form
			newEntryAmount = '';
			newEntryCategory = '';
			newEntryDescription = '';
			formErrors = {};
		} catch (error) {
			console.error('Failed to add entry:', error);
			// Could show user-friendly error message
		}
	};

	const getIconComponent = (iconName: string) => {
		switch (iconName) {
			case 'utensils': return Utensils;
			case 'plane': return Plane;
			case 'dollar-sign': return DollarSign;
			case 'tag': return Tag;
			default: return Tag;
		}
	};

	const getTotalSavings = (): number => {
		return entriesStore.filteredEntries.reduce((total, entry) => total + entry.amount, 0);
	};

	const getProgressPercentage = (): number => {
		if (!effortsStore.currentEffort?.targetAmount) return 0;
		const total = getTotalSavings();
		return Math.min((total / effortsStore.currentEffort.targetAmount) * 100, 100);
	};

	const getSavingsByCategory = (): { category: string; amount: number; color: string; percentage: number }[] => {
		const categoryTotals: { [key: string]: { amount: number; color: string } } = {};

		// Calculate total savings per category
		entriesStore.filteredEntries.forEach(entry => {
			if (!categoryTotals[entry.category]) {
				categoryTotals[entry.category] = { amount: 0, color: entry.categoryColor };
			}
			categoryTotals[entry.category].amount += entry.amount;
		});

		const totalSavings = getTotalSavings();
		const targetAmount = effortsStore.currentEffort?.targetAmount || totalSavings;

		// Convert to array with percentages relative to target
		return Object.entries(categoryTotals).map(([category, data]) => ({
			category,
			amount: data.amount,
			color: data.color,
			percentage: totalSavings > 0 ? (data.amount / targetAmount) * 100 : 0
		})).filter(item => item.percentage > 0);
	};
</script>

<div class="space-y-4">
	<div class="flex items-center gap-4">
		<button class="btn btn-ghost btn-sm" onclick={goBack} aria-label="Go back to efforts list">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
			</svg>
		</button>
		<div>
			<h1 class="text-2xl font-bold">{effortsStore.currentEffort?.name}</h1>
			<div class="text-sm text-base-content/70">
				Created: {effortsStore.currentEffort?.createdAt.toLocaleDateString()}
			</div>
		</div>
	</div>

	{#if effortsStore.currentEffort?.targetAmount}
		<div class="card bg-base-100 shadow-md">
			<div class="card-body p-4">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium">Progress</span>
					<span class="text-sm">${getTotalSavings().toLocaleString()} / ${effortsStore.currentEffort.targetAmount.toLocaleString()}</span>
				</div>
				<div class="w-full bg-base-200 rounded-full h-3 overflow-hidden">
					{#each getSavingsByCategory() as categoryData}
						<div
							class="h-full inline-block"
							style="width: {categoryData.percentage}%; background-color: {categoryData.color};"
							title="{categoryData.category}: ${categoryData.amount.toLocaleString()} ({Math.round(categoryData.percentage)}%)"
						></div>
					{/each}
				</div>
				<div class="text-xs text-base-content/70 mt-1">
					{Math.round(getProgressPercentage())}% complete
				</div>
				{#if getSavingsByCategory().length > 0}
					<div class="flex flex-wrap gap-2 mt-2">
						{#each getSavingsByCategory() as categoryData}
							<div class="flex items-center gap-1 text-xs">
								<div class="w-2 h-2 rounded-full" style="background-color: {categoryData.color};"></div>
								<span class="capitalize">{categoryData.category}</span>
								<span class="text-base-content/70">${categoryData.amount.toLocaleString()}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="card bg-base-100 shadow-md">
		<div class="card-body p-4">
			<h3 class="card-title text-lg mb-4">Add New Entry</h3>
			<form onsubmit={addEntry} class="space-y-3">
				<div class="form-control">
					<label class="label" for="entry-amount">
						<span class="label-text">Amount</span>
					</label>
					{#if formErrors.amount}
						<div class="text-error text-sm mb-1">{formErrors.amount}</div>
					{/if}
					<input
						id="entry-amount"
						type="number"
						step="0.01"
						min="0.01"
						placeholder="0.00"
						class="input input-bordered {formErrors.amount ? 'input-error' : ''}"
						bind:value={newEntryAmount}
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="category-selection">
						<span class="label-text">Category</span>
						<span class="label-text-alt text-base-content/50">Select a category for this entry</span>
					</label>
					{#if formErrors.category}
						<div class="text-error text-sm mb-1">{formErrors.category}</div>
					{/if}
					<div class="grid grid-cols-2 gap-2" id="category-selection">
						{#each categoriesStore.categories as category (category.id)}
							<button
								type="button"
								class="btn btn-outline btn-sm h-auto p-3 flex flex-col items-center gap-1 {newEntryCategory === category.id ? 'btn-primary' : ''}"
								style="border-color: {category.color}; color: {newEntryCategory === category.id ? 'white' : category.color};"
								onclick={() => newEntryCategory = category.id}
								aria-pressed={newEntryCategory === category.id}
								aria-label="Select {category.id} category"
							>
								<svelte:component this={getIconComponent(category.icon)} class="w-5 h-5" />
								<span class="text-xs capitalize">{category.id}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label" for="entry-description">
						<span class="label-text">Description (optional)</span>
					</label>
					<textarea
						id="entry-description"
						placeholder="Add a note about this entry..."
						class="textarea textarea-bordered resize-none"
						rows="2"
						bind:value={newEntryDescription}
					></textarea>
				</div>

				<button type="submit" class="btn btn-primary w-full" disabled={!newEntryAmount || !newEntryCategory}>Add Entry</button>
			</form>
		</div>
	</div>

	<div class="space-y-2">
		<h3 class="text-lg font-semibold">Entries</h3>
		{#if entriesStore.filteredEntries.length === 0}
			<div class="text-center py-8 text-base-content/50">
				No entries yet. Add your first savings entry above.
			</div>
		{:else}
			{#each entriesStore.sortedFilteredEntries as entry (entry.id)}
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body p-3">
						<div class="flex justify-between items-start">
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-1 badge" style="background-color: {entry.categoryColor}; color: white;">
									<svelte:component this={getIconComponent(entry.icon)} class="w-3 h-3" />
									<span class="capitalize">{entry.category}</span>
								</div>
								{#if entry.description}
									<span class="text-sm">{entry.description}</span>
								{/if}
							</div>
							<div class="text-right">
								<div class={`font-semibold ${entry.amount >= 0 ? 'text-success' : 'text-error'}`}>
									{entry.amount >= 0 ? '+' : ''}${entry.amount.toLocaleString()}
								</div>
								<div class="text-xs text-base-content/50">
									{entry.createdAt.toLocaleDateString()}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>