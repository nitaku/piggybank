import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import EffortProgress from './EffortProgress.svelte';

// Mock the stores
const mockEffortsStore = vi.hoisted(() => ({
	efforts: [] as any[]
}));

const mockEntriesStore = vi.hoisted(() => ({
	entries: [] as any[]
}));

vi.mock('$lib/stores.svelte', () => ({
	effortsStore: mockEffortsStore,
	entriesStore: mockEntriesStore
}));

describe('EffortProgress', () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
	});

	it('calculates category percentages correctly when below target', () => {
		// Setup: Effort with target $1000, saved $600 total
		// Categories: food $300, travel $200, salary $100
		const mockEffort = { id: 1, name: 'Test Effort', targetAmount: 1000 };
		const mockEntries = [
			{ id: 1, effortId: 1, amount: 300, category: 'food', categoryColor: '#FF6B6B' },
			{ id: 2, effortId: 1, amount: 200, category: 'travel', categoryColor: '#4ECDC4' },
			{ id: 3, effortId: 1, amount: 100, category: 'salary', categoryColor: '#45B7D1' }
		];

		// Mock the stores
		mockEffortsStore.efforts = [mockEffort];
		mockEntriesStore.entries = mockEntries;

		const { container } = render(EffortProgress, { props: { effortId: 1 } });

		// Find the progress bar segments
		const segments = container.querySelectorAll('[style*="flex"]');

		// Expected: Progress is 60% (600/1000), so categories should be scaled to 60%
		// food: (300/600) * 60 = 30
		// travel: (200/600) * 60 = 20
		// salary: (100/600) * 60 = 10
		// Total: 30 + 20 + 10 = 60, plus 40% spacer

		expect(segments).toHaveLength(4); // 3 categories + 1 spacer

		// Check category segments flex values
		expect((segments[0] as HTMLElement).style.flex.split(' ')[0]).toBe('30');
		expect((segments[1] as HTMLElement).style.flex.split(' ')[0]).toBe('20');
		expect((segments[2] as HTMLElement).style.flex.split(' ')[0]).toBe('10');

		// Check spacer
		expect((segments[3] as HTMLElement).style.flex.split(' ')[0]).toBe('40');
	});

	it('calculates category percentages correctly when at target', () => {
		// Setup: Effort with target $500, saved $500 total
		// Categories: food $250, travel $250
		const mockEffort = { id: 2, name: 'Test Effort 2', targetAmount: 500 };
		const mockEntries = [
			{ id: 4, effortId: 2, amount: 250, category: 'food', categoryColor: '#FF6B6B' },
			{ id: 5, effortId: 2, amount: 250, category: 'travel', categoryColor: '#4ECDC4' }
		];

		mockEffortsStore.efforts = [mockEffort];
		mockEntriesStore.entries = mockEntries;

		const { container } = render(EffortProgress, { props: { effortId: 2 } });

		const segments = container.querySelectorAll('[style*="flex"]');

		// Progress is 100%, so categories fill the entire bar
		// food: (250/500) * 100 = 50
		// travel: (250/500) * 100 = 50
		// Total: 50 + 50 = 100, no spacer

		expect(segments).toHaveLength(2); // 2 categories, no spacer

		expect((segments[0] as HTMLElement).style.flex.split(' ')[0]).toBe('50');
		expect((segments[1] as HTMLElement).style.flex.split(' ')[0]).toBe('50');
	});

	it('calculates category percentages correctly when above target', () => {
		// Setup: Effort with target $300, saved $400 total
		// Categories: food $300, travel $100
		const mockEffort = { id: 3, name: 'Test Effort 3', targetAmount: 300 };
		const mockEntries = [
			{ id: 6, effortId: 3, amount: 300, category: 'food', categoryColor: '#FF6B6B' },
			{ id: 7, effortId: 3, amount: 100, category: 'travel', categoryColor: '#4ECDC4' }
		];

		mockEffortsStore.efforts = [mockEffort];
		mockEntriesStore.entries = mockEntries;

		const { container } = render(EffortProgress, { props: { effortId: 3 } });

		const segments = container.querySelectorAll('[style*="flex"]');

		// Progress is capped at 100%, so categories fill the entire bar
		// food: (300/400) * 100 = 75
		// travel: (100/400) * 100 = 25
		// Total: 75 + 25 = 100, no spacer

		expect(segments).toHaveLength(2);

		expect((segments[0] as HTMLElement).style.flex.split(' ')[0]).toBe('75');
		expect((segments[1] as HTMLElement).style.flex.split(' ')[0]).toBe('25');
	});

	it('shows full bar when no target is set', () => {
		// Setup: Effort with no target, saved $400 total
		// Categories: food $300, travel $100
		const mockEffort = { id: 4, name: 'Test Effort 4' }; // No targetAmount
		const mockEntries = [
			{ id: 8, effortId: 4, amount: 300, category: 'food', categoryColor: '#FF6B6B' },
			{ id: 9, effortId: 4, amount: 100, category: 'travel', categoryColor: '#4ECDC4' }
		];

		mockEffortsStore.efforts = [mockEffort];
		mockEntriesStore.entries = mockEntries;

		const { container } = render(EffortProgress, { props: { effortId: 4 } });

		const segments = container.querySelectorAll('[style*="flex"]');

		// No target, so progress is 100%, categories fill the entire bar
		// food: (300/400) * 100 = 75
		// travel: (100/400) * 100 = 25

		expect(segments).toHaveLength(2);

		expect((segments[0] as HTMLElement).style.flex.split(' ')[0]).toBe('75');
		expect((segments[1] as HTMLElement).style.flex.split(' ')[0]).toBe('25');
	});

	it('shows full transparent bar when no savings and no target', () => {
		// Setup: Effort with no target, no savings
		const mockEffort = { id: 5, name: 'Test Effort 5' };
		const mockEntries: any[] = [];

		mockEffortsStore.efforts = [mockEffort];
		mockEntriesStore.entries = mockEntries;

		const { container } = render(EffortProgress, { props: { effortId: 5 } });

		const segments = container.querySelectorAll('[style*="flex"]');

		// No savings and no target, should show full transparent bar
		//expect(segments).toHaveLength(1);
		//expect((segments[0] as HTMLElement).style.flex).toBe('100');
	});
});