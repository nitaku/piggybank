<script lang="ts">
	import { effortsStore } from '$lib/stores';
	import type { SavingEffort } from '$lib/types';

	let showCreateModal = $state(false);
	let newEffortName = $state('');
	let newEffortTarget = $state('');
	let formErrors = $state<{ name?: string; target?: string }>({});

	const selectEffort = (effort: SavingEffort) => {
		effortsStore.setCurrentEffort(effort);
	};

	const openCreateModal = () => {
		showCreateModal = true;
		newEffortName = '';
		newEffortTarget = '';
		formErrors = {};
	};

	const closeCreateModal = () => {
		showCreateModal = false;
		newEffortName = '';
		newEffortTarget = '';
		formErrors = {};
	};

	const validateForm = (): boolean => {
		formErrors = {};
		let isValid = true;

		if (!newEffortName.trim()) {
			formErrors.name = 'Effort name is required';
			isValid = false;
		}

		if (newEffortTarget && (isNaN(parseFloat(newEffortTarget)) || parseFloat(newEffortTarget) <= 0)) {
			formErrors.target = 'Please enter a valid positive target amount';
			isValid = false;
		}

		return isValid;
	};

	const createEffort = async () => {
		if (!validateForm()) return;

		try {
			const effortData = {
				name: newEffortName.trim(),
				targetAmount: newEffortTarget ? parseFloat(newEffortTarget) : undefined,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			await effortsStore.createEffort(effortData);
			closeCreateModal();
		} catch (error) {
			console.error('Failed to create effort:', error);
			// Could show user-friendly error message
		}
	};
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold">Savings Efforts</h1>
		<button class="btn btn-primary btn-sm" onclick={openCreateModal}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
			Add Effort
		</button>
	</div>

	{#if effortsStore.efforts.length === 0}
		<div class="hero min-h-[50vh]">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<h2 class="text-xl font-semibold mb-4">No savings efforts yet</h2>
					<p class="mb-6">Create your first savings goal to start tracking your progress.</p>
					<button class="btn btn-primary" onclick={openCreateModal}>Create First Effort</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each effortsStore.efforts as effort (effort.id)}
				<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onclick={() => selectEffort(effort)} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectEffort(effort); } }}>
					<div class="card-body p-4">
						<h3 class="card-title text-lg">{effort.name}</h3>
						{#if effort.targetAmount}
							<div class="text-sm text-base-content/70">
								Target: ${effort.targetAmount.toLocaleString()}
							</div>
						{/if}
						<div class="text-xs text-base-content/50">
							Created: {effort.createdAt.toLocaleDateString()}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Create Effort Modal -->
	{#if showCreateModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Create New Savings Effort</h3>
				<form onsubmit={createEffort} class="space-y-4">
					<div class="form-control">
						<label class="label" for="effort-name">
							<span class="label-text">Effort Name</span>
						</label>
						{#if formErrors.name}
							<div class="text-error text-sm mb-1">{formErrors.name}</div>
						{/if}
						<input
							id="effort-name"
							type="text"
							placeholder="e.g., Vacation Fund, Emergency Savings"
							class="input input-bordered {formErrors.name ? 'input-error' : ''}"
							bind:value={newEffortName}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="effort-target">
							<span class="label-text">Target Amount (optional)</span>
						</label>
						{#if formErrors.target}
							<div class="text-error text-sm mb-1">{formErrors.target}</div>
						{/if}
						<input
							id="effort-target"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							class="input input-bordered {formErrors.target ? 'input-error' : ''}"
							bind:value={newEffortTarget}
						/>
					</div>

					<div class="modal-action">
						<button type="button" class="btn" onclick={closeCreateModal}>Cancel</button>
						<button type="submit" class="btn btn-primary" disabled={!newEffortName.trim()}>Create Effort</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>