export interface SavingEffort {
	id: number;
	name: string;
	targetAmount?: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface SavingsEntry {
	id: number;
	effortId: number;
	amount: number;
	category: string;
	categoryColor: string;
	icon: string;
	description?: string;
	createdAt: Date;
}

export interface Category {
	id: string;
	color: string;
	icon: string;
}