# Technical Specification: PiggyBank Savings App

## Overview

A minimalist web mobile app for tracking savings progress locally. Built with Svelte 5, DaisyUI, and Dexie.js for local storage. Supports multiple saving efforts with categorized entries.

## Requirements Analysis

- **Multiple Saving Efforts**: Users can create and manage multiple savings goals
- **Savings Entries**: Each entry includes amount, category (with color), icon, and description
- **Local Storage**: All data stored locally using IndexedDB via Dexie.js
- **Mobile-First**: Responsive design optimized for mobile devices
- **Minimalist UI**: Clean, simple interface using DaisyUI components

## Data Schema

### Saving Effort

```typescript
interface SavingEffort {
	id: number; // Auto-incremented primary key
	name: string; // e.g., "Vacation Fund", "Emergency Savings"
	targetAmount: number; // Optional target amount
	createdAt: Date;
	updatedAt: Date;
}
```

### Savings Entry

```typescript
interface SavingsEntry {
	id: number; // Auto-incremented primary key
	effortId: number; // Foreign key to SavingEffort
	amount: number; // Positive for deposits, negative for withdrawals
	category: string; // e.g., "food", "travel", "salary"
	categoryColor: string; // Hex color code, e.g., "#FF6B6B"
	icon: string; // Icon identifier, e.g., "utensils", "plane"
	description: string; // Optional description
	createdAt: Date;
}
```

### Category Definition

```typescript
interface Category {
	id: string; // Category name as key
	color: string; // Default color
	icon: string; // Default icon
}
```

## Component Structure

### App Layout

```
App.svelte (Root)
├── Header.svelte
├── EffortList.svelte
├── EffortDetail.svelte
└── Footer.svelte
```

### Effort Management

```
EffortList.svelte
├── EffortCard.svelte (for each effort)
│   ├── EffortProgress.svelte
│   └── EffortActions.svelte
└── AddEffortButton.svelte
```

### Entry Management

```
EffortDetail.svelte
├── EntryList.svelte
│   └── EntryItem.svelte (for each entry)
├── AddEntryForm.svelte
│   ├── AmountInput.svelte
│   ├── CategorySelector.svelte
│   └── DescriptionInput.svelte
└── EffortSummary.svelte
```

### Shared Components

```
CategorySelector.svelte
├── CategoryBadge.svelte
└── CategoryPicker.svelte

Modal.svelte (reusable modal component)
Toast.svelte (notification component)
```

## State Management

### Svelte 5 Runes Approach

Using Svelte 5's new runes for reactive state management:

```typescript
// stores/efforts.ts
let efforts = $state<SavingEffort[]>([]);
let currentEffort = $state<SavingEffort | null>(null);

// stores/entries.ts
let entries = $state<SavingsEntry[]>([]);
let filteredEntries = $derived(entries.filter((entry) => entry.effortId === currentEffort?.id));

// stores/categories.ts
let categories = $state<Category[]>([
	{ id: 'food', color: '#FF6B6B', icon: 'utensils' },
	{ id: 'travel', color: '#4ECDC4', icon: 'plane' }
	// ... more categories
]);
```

### State Updates

- **Efforts**: CRUD operations managed through dedicated functions
- **Entries**: Filtered by current effort, real-time updates
- **Categories**: Static list with potential for user customization

## Data Persistence with Dexie.js

### Database Schema

```typescript
import Dexie, { Table } from 'dexie';

export class PiggyBankDB extends Dexie {
	efforts!: Table<SavingEffort>;
	entries!: Table<SavingsEntry>;

	constructor() {
		super('PiggyBankDB');
		this.version(1).stores({
			efforts: '++id, name, targetAmount, createdAt, updatedAt',
			entries: '++id, effortId, amount, category, categoryColor, icon, description, createdAt'
		});
	}
}

export const db = new PiggyBankDB();
```

### Persistence Operations

#### Initialization

```typescript
// Initialize database and load data
async function initializeApp() {
	await db.open();
	efforts = await db.efforts.toArray();
	entries = await db.entries.toArray();
}
```

#### CRUD Operations

```typescript
// Efforts
async function createEffort(effort: Omit<SavingEffort, 'id'>) {
	const id = await db.efforts.add(effort);
	efforts.push({ ...effort, id });
}

async function updateEffort(id: number, updates: Partial<SavingEffort>) {
	await db.efforts.update(id, { ...updates, updatedAt: new Date() });
	const index = efforts.findIndex((e) => e.id === id);
	if (index !== -1) {
		efforts[index] = { ...efforts[index], ...updates, updatedAt: new Date() };
	}
}

async function deleteEffort(id: number) {
	await db.efforts.delete(id);
	await db.entries.where('effortId').equals(id).delete();
	efforts = efforts.filter((e) => e.id !== id);
	entries = entries.filter((e) => e.effortId !== id);
}

// Entries
async function addEntry(entry: Omit<SavingsEntry, 'id'>) {
	const id = await db.entries.add(entry);
	entries.push({ ...entry, id });
}

async function updateEntry(id: number, updates: Partial<SavingsEntry>) {
	await db.entries.update(id, updates);
	const index = entries.findIndex((e) => e.id === id);
	if (index !== -1) {
		entries[index] = { ...entries[index], ...updates };
	}
}

async function deleteEntry(id: number) {
	await db.entries.delete(id);
	entries = entries.filter((e) => e.id !== id);
}
```

### Data Synchronization

- All state changes trigger database updates
- Database serves as single source of truth
- Reactive state automatically updates UI when data changes

## UI/UX Design

### Mobile-First Responsive Design

- Single-column layout optimized for mobile screens
- Touch-friendly buttons and inputs
- Swipe gestures for entry management (future enhancement)

### DaisyUI Components

- **Cards**: For effort and entry display
- **Buttons**: Primary actions (add, edit, delete)
- **Modals**: Forms for creating/editing
- **Badges**: Category indicators with colors
- **Progress bars**: Savings progress visualization

### Color Scheme

- Primary: DaisyUI default theme
- Category colors: Vibrant, distinct colors for easy identification
- Success/Error states: Standard green/red indicators

## Performance Considerations

### Lazy Loading

- Load entries only for current effort
- Implement pagination for large entry lists

### IndexedDB Optimization

- Proper indexing on frequently queried fields
- Batch operations for bulk updates

### Memory Management

- Clean up unused reactive statements
- Efficient data structures for large datasets

## Security and Privacy

- All data stored locally in browser
- No external API calls or data transmission
- User data remains private and secure

## Future Enhancements

- Data export/import functionality
- Cloud backup integration
- Advanced analytics and reporting
- Custom category creation
- Recurring savings entries

## Development Setup

- Svelte 5 with TypeScript
- Vite for build tooling
- DaisyUI for component library
- Dexie.js for IndexedDB wrapper
- ESLint and Prettier for code quality
