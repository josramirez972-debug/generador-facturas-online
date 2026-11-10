import { InvoiceItem, InvoiceTotals, TaxConfig } from '../types/invoice';

export function calculateLineAmounts(
  item: InvoiceItem,
  taxEnabled: boolean
): {
  gross: number;
  discountAmount: number;
  netBeforeTax: number;
  taxAmount: number;
  lineTotal: number;
} {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const price = Math.max(0, Number(item.unitPrice) || 0);
  const discountPct = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
  const taxPct = taxEnabled ? Math.min(100, Math.max(0, Number(item.taxPercent) || 0)) : 0;

  const gross = qty * price;
  const discountAmount = gross * (discountPct / 100);
  const netBeforeTax = gross - discountAmount;
  const taxAmount = netBeforeTax * (taxPct / 100);
  const lineTotal = netBeforeTax + taxAmount;

  return {
    gross,
    discountAmount,
    netBeforeTax,
    taxAmount,
    lineTotal,
  };
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxConfig: TaxConfig
): InvoiceTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableBase = 0;
  let taxTotal = 0;

  for (const item of items) {
    const line = calculateLineAmounts(item, taxConfig.enabled);
    subtotal += line.gross;
    discountTotal += line.discountAmount;
    taxableBase += line.netBeforeTax;
    taxTotal += line.taxAmount;
  }

  const grandTotal = taxableBase + taxTotal;

  return {
    subtotal,
    discountTotal,
    taxableBase,
    taxTotal,
    grandTotal,
  };
}
