import Dexie, { type Table } from 'dexie';
import type { SavingEffort, SavingsEntry, Category } from './types';

export class PiggyBankDB extends Dexie {
	efforts!: Table<SavingEffort>;
	entries!: Table<SavingsEntry>;
	categories!: Table<Category>;

	constructor() {
		super('PiggyBankDB');
		this.version(2).stores({
			efforts: '++id, name, targetAmount, createdAt, updatedAt',
			entries: '++id, effortId, amount, category, description, createdAt',
			categories: 'id, color, icon'
		});
	}
}

export const db = new PiggyBankDB();