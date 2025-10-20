export const CURRENCY_CONFIG = {
	symbol: '€',
	code: 'EUR',
	locale: 'en-EU', // European English locale for euro formatting
	name: 'Euro'
} as const;

export type CurrencyConfig = typeof CURRENCY_CONFIG;

/**
 * Formats a number as currency using the configured currency settings
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
		style: 'currency',
		currency: CURRENCY_CONFIG.code
	}).format(amount);
}

/**
 * Formats a number with the currency symbol only (no full currency formatting)
 */
export function formatCurrencySimple(amount: number): string {
	return `${CURRENCY_CONFIG.symbol}${amount.toLocaleString()}`;
}