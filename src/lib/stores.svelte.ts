import { dexieService } from './dexie-service';
import type { SavingEffort, SavingsEntry, Category } from './types';

// Reactive state using Svelte 5 runes - only initialize in browser
let efforts: SavingEffort[] = $state([]);
let entries: SavingsEntry[] = $state([]);
let currentEffort: SavingEffort | null = $state(null);
const categories: Category[] = [
	{ id: 'food', color: '#FF6B6B', icon: 'utensils' },
	{ id: 'travel', color: '#4ECDC4', icon: 'plane' },
	{ id: 'salary', color: '#45B7D1', icon: 'dollar-sign' },
	{ id: 'other', color: '#96CEB4', icon: 'tag' }
];

// Derived state - computed in getters
function getFilteredEntries() {
	return currentEffort ? entries.filter(entry => entry.effortId === currentEffort!.id) : [];
}

// Store actions with synchronization
export const effortsStore = {
	get efforts() { return efforts; },
	get sortedEfforts() {
		return efforts.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	},
	get currentEffort() { return currentEffort; },

	async loadEfforts() {
		try {
			efforts = await dexieService.getEfforts();
		} catch (error) {
			console.error('Failed to load efforts:', error);
			throw error;
		}
	},

	async createEffort(effortData: Omit<SavingEffort, 'id'>) {
		try {
			const id = await dexieService.createEffort(effortData);
			const newEffort = { ...effortData, id } as SavingEffort;
			efforts.push(newEffort);
			efforts = [...efforts]; // Trigger reactivity
		} catch (error) {
			console.error('Failed to create effort:', error);
			throw error;
		}
	},

	async updateEffort(id: number, updates: Partial<Omit<SavingEffort, 'id'>>) {
		await dexieService.updateEffort(id, updates);
		const index = efforts.findIndex(e => e.id === id);
		if (index !== -1) {
			efforts[index] = { ...efforts[index], ...updates, updatedAt: new Date() };
		}
	},

	async deleteEffort(id: number) {
		await dexieService.deleteEffort(id);
		efforts = efforts.filter(e => e.id !== id);
		entries = entries.filter(e => e.effortId !== id);
		if (currentEffort?.id === id) {
			currentEffort = null;
		}
	},

	setCurrentEffort(effort: SavingEffort | null) {
		currentEffort = effort;
	}
};

export const entriesStore = {
 	get entries() { return entries; },
 	get filteredEntries() { return getFilteredEntries(); },
 	get sortedFilteredEntries() {
 		return getFilteredEntries().toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
 	},

	async loadEntries(effortId?: number) {
		try {
			entries = await dexieService.getEntries(effortId);
		} catch (error) {
			console.error('Failed to load entries:', error);
			throw error;
		}
	},

	async createEntry(entryData: Omit<SavingsEntry, 'id'>) {
		try {
			const id = await dexieService.createEntry(entryData);
			const newEntry = { ...entryData, id } as SavingsEntry;
			entries.push(newEntry);
			entries = [...entries]; // Trigger reactivity

			// Update the associated effort's updatedAt timestamp
			await effortsStore.updateEffort(entryData.effortId, {});
		} catch (error) {
			console.error('Failed to create entry:', error);
			throw error;
		}
	},

	async updateEntry(id: number, updates: Partial<Omit<SavingsEntry, 'id'>>) {
		await dexieService.updateEntry(id, updates);
		const index = entries.findIndex(e => e.id === id);
		if (index !== -1) {
			entries[index] = { ...entries[index], ...updates };
		}
	},

	async deleteEntry(id: number) {
		await dexieService.deleteEntry(id);
		entries = entries.filter(e => e.id !== id);
	}
};

export const categoriesStore = {
	get categories() { return categories; }
};

// Initialization
export async function initializeStores() {
	try {
		await dexieService.initialize();
		await effortsStore.loadEfforts();
		await entriesStore.loadEntries();
	} catch (error) {
		console.error('Failed to initialize stores:', error);
		throw error;
	}
}