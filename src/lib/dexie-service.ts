import { db } from './database';
import type { SavingEffort, SavingsEntry } from './types';

export class DexieService {
	// Efforts CRUD operations
	async createEffort(effort: Omit<SavingEffort, 'id'>): Promise<number> {
		const now = new Date();
		const effortWithTimestamps = {
			...effort,
			createdAt: now,
			updatedAt: now
		};
		return await db.efforts.add(effortWithTimestamps as SavingEffort);
	}

	async getEfforts(): Promise<SavingEffort[]> {
		return await db.efforts.toArray();
	}

	async updateEffort(id: number, updates: Partial<Omit<SavingEffort, 'id'>>): Promise<void> {
		await db.efforts.update(id, { ...updates, updatedAt: new Date() });
	}

	async deleteEffort(id: number): Promise<void> {
		await db.efforts.delete(id);
		await db.entries.where('effortId').equals(id).delete();
	}

	// Entries CRUD operations
	async createEntry(entry: Omit<SavingsEntry, 'id'>): Promise<number> {
		const entryWithTimestamp = {
			...entry,
			createdAt: new Date()
		};
		return await db.entries.add(entryWithTimestamp as SavingsEntry);
	}

	async getEntries(effortId?: number): Promise<SavingsEntry[]> {
		if (effortId !== undefined) {
			return await db.entries.where('effortId').equals(effortId).toArray();
		}
		return await db.entries.toArray();
	}

	async updateEntry(id: number, updates: Partial<Omit<SavingsEntry, 'id'>>): Promise<void> {
		await db.entries.update(id, updates);
	}

	async deleteEntry(id: number): Promise<void> {
		await db.entries.delete(id);
	}

	// Initialization
	async initialize(): Promise<void> {
		try {
			await db.open();
		} catch (error) {
			console.error('Failed to initialize database:', error);
			throw error;
		}
	}
}

export const dexieService = new DexieService();