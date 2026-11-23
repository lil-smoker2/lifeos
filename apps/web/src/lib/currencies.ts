export const DEFAULT_CURRENCY = 'USD'

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'NPR', name: 'Nepalese Rupee' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'TRY', name: 'Turkish Lira' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}
