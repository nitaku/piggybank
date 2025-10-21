import { dexieService } from './dexie-service';
import type { SavingEffort, SavingsEntry, Category } from './types';
import { schemeObservable10 } from 'd3-scale-chromatic';

// Reactive state using Svelte 5 runes - only initialize in browser
let efforts: SavingEffort[] = $state([]);
let entries: SavingsEntry[] = $state([]);
let currentEffort: SavingEffort | null = $state(null);
const categories: Category[] = [
	{ id: 'food', color: schemeObservable10[0], icon: 'utensils' },
	{ id: 'travel', color: schemeObservable10[1], icon: 'plane' },
	{ id: 'salary', color: schemeObservable10[2], icon: 'dollar-sign' },
	{ id: 'games', color: schemeObservable10[3], icon: 'gamepad-2' },
	{ id: 'fuel', color: schemeObservable10[4], icon: 'fuel' },
	{ id: 'sells', color: schemeObservable10[5], icon: 'shopping-cart' },
	{ id: 'taxes', color: schemeObservable10[6], icon: 'file-text' },
	{ id: 'charity', color: schemeObservable10[7], icon: 'heart' },
	{ id: 'finance', color: schemeObservable10[8], icon: 'trending-up' },
	{ id: 'other', color: schemeObservable10[9], icon: 'tag' }
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

// Migration function to clean up old categoryColor and icon fields from entries
async function migrateEntryFields() {
	try {
		// Since we're removing categoryColor and icon from the model,
		// we don't need to migrate data - the fields will be ignored
		console.log('Migration: Removed categoryColor and icon fields from SavingsEntry model');
	} catch (error) {
		console.error('Failed to run migration:', error);
		// Don't throw - migration failure shouldn't prevent app startup
	}
}

// Service Worker debugging
function debugServiceWorker() {
	if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
		console.log('Service Worker Debug: Checking registration...');

		navigator.serviceWorker.getRegistrations().then(registrations => {
			console.log('Service Worker Debug: Found registrations:', registrations.length);
			registrations.forEach(reg => {
				console.log('Service Worker Debug: Registration:', {
					scope: reg.scope,
					active: !!reg.active,
					installing: !!reg.installing,
					waiting: !!reg.waiting,
					state: reg.active?.state
				});
			});
		}).catch(err => console.error('Service Worker Debug: Error getting registrations:', err));

		navigator.serviceWorker.ready.then(reg => {
			console.log('Service Worker Debug: Ready registration:', {
				scope: reg.scope,
				active: !!reg.active,
				state: reg.active?.state
			});

			// Check caches
			if ('caches' in window) {
				caches.keys().then(cacheNames => {
					console.log('Service Worker Debug: Cache names:', cacheNames);
					cacheNames.forEach(name => {
						caches.open(name).then(cache => {
							cache.keys().then(requests => {
								console.log(`Service Worker Debug: Cache "${name}" has ${requests.length} entries`);
								requests.slice(0, 5).forEach(req => {
									console.log(`  - ${req.url}`);
								});
								if (requests.length > 5) {
									console.log(`  ... and ${requests.length - 5} more`);
								}
							});
						});
					});
				}).catch(err => console.error('Service Worker Debug: Error checking caches:', err));
			}
		}).catch(err => console.error('Service Worker Debug: Error waiting for ready:', err));
	} else {
		console.log('Service Worker Debug: Service Worker not supported or not in browser');
	}
}

// Initialization
export async function initializeStores() {
	try {
		await dexieService.initialize();
		await migrateEntryFields(); // Run migration before loading data
		await effortsStore.loadEfforts();
		await entriesStore.loadEntries();

		// Debug service worker after initialization
		debugServiceWorker();
	} catch (error) {
		console.error('Failed to initialize stores:', error);
		throw error;
	}
}