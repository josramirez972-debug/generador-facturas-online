import { CURRENCIES } from '../config/regional';
import { CurrencyCode } from '../types/invoice';

export function formatCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode,
  includeCode = true
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    const formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(safeAmount);

    return includeCode
      ? `${config.symbol}${formattedNumber} ${config.code}`
      : `${config.symbol}${formattedNumber}`;
  } catch {
    const fallback = safeAmount.toFixed(config.decimals);
    return includeCode
      ? `${config.symbol}${fallback} ${config.code}`
      : `${config.symbol}${fallback}`;
  }
}

export function formatDisplayDate(isoDateString: string): string {
  if (!isoDateString) return '—';
  const parts = isoDateString.split('-');
  if (parts.length !== 3) return isoDateString;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return isoDateString;

  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  const monthLabel = months[month - 1] || '';
  return `${String(day).padStart(2, '0')} ${monthLabel} ${year}`;
}

export function generateNextInvoiceNumber(existingNumbers: string[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `FAC-${currentYear}-`;
  let maxSeq = 0;

  for (const num of existingNumbers) {
    if (num.startsWith(prefix)) {
      const seqPart = parseInt(num.slice(prefix.length), 10);
      if (!Number.isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

export function generateNextQuoteNumber(existingNumbers: string[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `COT-${currentYear}-`;
  let maxSeq = 0;

  for (const num of existingNumbers) {
    if (num.startsWith(prefix)) {
      const seqPart = parseInt(num.slice(prefix.length), 10);
      if (!Number.isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}
