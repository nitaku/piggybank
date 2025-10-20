<script lang="ts">
	import { effortsStore, entriesStore, categoriesStore } from '$lib/stores.svelte';
	import type { SavingsEntry } from '$lib/types';
	import { Utensils, Plane, DollarSign, Tag, Gamepad2, Fuel, ShoppingCart, FileText, Heart, TrendingUp } from 'lucide-svelte';
	import EffortProgress from './EffortProgress.svelte';
	import { formatCurrency, CURRENCY_CONFIG } from '$lib/currency';

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
			const entry: Omit<SavingsEntry, 'id'> = {
				effortId: effortsStore.currentEffort.id,
				amount: parseFloat(newEntryAmount),
				category: newEntryCategory,
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
			case 'gamepad-2': return Gamepad2;
			case 'fuel': return Fuel;
			case 'shopping-cart': return ShoppingCart;
			case 'file-text': return FileText;
			case 'heart': return Heart;
			case 'trending-up': return TrendingUp;
			case 'tag': return Tag;
			default: return Tag;
		}
	};

	const getContrastingColor = (hexColor: string): string => {
		// Remove # if present
		const color = hexColor.replace('#', '');
		// Parse RGB
		const r = parseInt(color.substr(0, 2), 16);
		const g = parseInt(color.substr(2, 2), 16);
		const b = parseInt(color.substr(4, 2), 16);
		// Calculate luminance (perceived brightness)
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		// Return black for light colors, white for dark colors
		return luminance > 0.5 ? '#000000' : '#ffffff';
	};

</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<button class="btn btn-ghost btn-sm" onclick={goBack} aria-label="Go back to efforts list">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
			</svg>
		</button>
		<div>
			<h1 class="text-3xl font-bold">{effortsStore.currentEffort?.name}</h1>
			<div class="text-sm text-base-content/70 mt-1">
				Created: {effortsStore.currentEffort?.createdAt.toLocaleDateString()}
			</div>
		</div>
	</div>

	<div class="card bg-base-100 shadow-md">
		<div class="card-body p-6">
			<EffortProgress effortId={effortsStore.currentEffort!.id} showTotal={true} />
		</div>
	</div>

	<div class="card bg-base-100 shadow-md">
		<div class="card-body p-6">
			<h3 class="card-title text-xl font-semibold mb-6">Add New Entry</h3>
			<form onsubmit={addEntry} class="space-y-4">
				<div class="form-control">
					<label class="label mb-2" for="entry-amount">
						<span class="label-text">Amount</span>
					</label>
					{#if formErrors.amount}
						<div class="text-error text-sm mb-1">{formErrors.amount}</div>
					{/if}
					<div class="flex items-baseline justify-center">
						<span class="text-base-content/60 text-xl font-medium opacity-0 mr-2">€</span>
						<input
							id="entry-amount"
							type="number"
							step="0.01"
							min="0.01"
							class="w-32 pb-2 bg-transparent border-0 border-b-2 border-base-content/20 focus:border-primary focus:outline-none text-xl font-medium text-center {formErrors.amount ? 'border-error' : ''}"
							style="-webkit-appearance: none; -moz-appearance: textfield;"
							bind:value={newEntryAmount}
							required
						/>
						<span class="text-base-content/60 text-xl font-medium ml-2">{CURRENCY_CONFIG.symbol}</span>
					</div>
				</div>

				<div class="form-control">
					<label class="label mb-2" for="category-selection">
						<span class="label-text-alt text-sm text-base-content/60">Select a category for this entry</span>
					</label>
					{#if formErrors.category}
						<div class="text-error text-sm mb-1">{formErrors.category}</div>
					{/if}
					<div class="grid grid-cols-2 gap-2" id="category-selection">
						{#each categoriesStore.categories as category (category.id)}
							{@const isSelected = newEntryCategory === category.id}
							{@const textColor = isSelected ? getContrastingColor(category.color) : category.color}
							<button
								type="button"
								class="btn btn-outline btn-sm h-auto p-3 flex flex-col items-center gap-1"
								style="border-color: {category.color}; background-color: {isSelected ? category.color : 'transparent'}; color: {textColor};"
								onclick={() => newEntryCategory = category.id}
								aria-pressed={isSelected}
								aria-label="Select {category.id} category"
							>
								<svelte:component this={getIconComponent(category.icon)} class="w-5 h-5" />
								<span class="text-xs capitalize">{category.id}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label mb-2" for="entry-description">
						<span class="label-text">Description (optional)</span>
					</label>
					<textarea
						id="entry-description"
						placeholder="Add a note about this entry..."
						class="textarea textarea-bordered resize-none w-full"
						rows="3"
						bind:value={newEntryDescription}
					></textarea>
				</div>

				<button type="submit" class="btn btn-primary w-full" disabled={!newEntryAmount || !newEntryCategory}>Add Entry</button>
			</form>
		</div>
	</div>

	<div class="space-y-3">
		<h3 class="text-xl font-semibold mb-4">Entries</h3>
		{#if entriesStore.filteredEntries.length === 0}
			<div class="text-center py-8 text-base-content/50">
				No entries yet. Add your first savings entry above.
			</div>
		{:else}
			{#each entriesStore.sortedFilteredEntries as entry (entry.id)}
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body p-4">
						<div class="flex justify-between items-start">
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-1 badge" style="background-color: {categoriesStore.categories.find(c => c.id === entry.category)?.color || '#666'}; color: white;">
									<svelte:component this={getIconComponent(categoriesStore.categories.find(c => c.id === entry.category)?.icon || 'tag')} class="w-3 h-3" />
									<span class="capitalize">{entry.category}</span>
								</div>
								{#if entry.description}
									<span class="text-sm">{entry.description}</span>
								{/if}
							</div>
							<div class="text-right">
									<div class={`font-semibold ${entry.amount >= 0 ? 'text-success' : 'text-error'}`}>
										{entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
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