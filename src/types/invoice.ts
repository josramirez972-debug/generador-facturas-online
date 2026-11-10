export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'MXN' | 'PEN' | 'CLP' | 'ARS';

export type TaxIdLabel = 'NIT' | 'RUT' | 'RFC' | 'RUC' | 'CUIT' | 'NIF' | 'ID Fiscal' | string;

export type InvoiceStatus = 'draft' | 'generated' | 'sent' | 'paid' | 'overdue';

export type PaletteId = 'minimalist' | 'professional-blue' | 'elegant-green' | 'custom';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  lightSurface: string;
  background: string;
  swatches: { label: string; hex: string }[];
}

export interface EmitterProfile {
  id: string;
  name: string;
  companyName?: string;
  activity: string;
  email: string;
  phone: string;
  taxIdLabel: string;
  taxId: string;
  city: string;
  country: string;
  address: string;
  logoDataUrl?: string | null;
  primaryColor: string;
  selectedPaletteId: PaletteId;
}

export interface ClientData {
  id: string;
  name: string;
  companyName?: string;
  taxIdLabel: string;
  taxId: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

export interface InvoiceItem {
  id: string;
  concept: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface TaxConfig {
  enabled: boolean;
  label: string;
  defaultRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountTotal: number;
  taxableBase: number;
  taxTotal: number;
  grandTotal: number;
}

export interface Invoice {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  paymentMethod: string;
  emitter: EmitterProfile;
  client: ClientData;
  items: InvoiceItem[];
  taxConfig: TaxConfig;
  totals: InvoiceTotals;
  notes: string;
  primaryColor: string;
  paletteId: PaletteId;
  status: InvoiceStatus;
  sourceQuoteId?: string;
  sourceQuoteNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted';

export type QuoteTitleType = 'COTIZACIÓN' | 'PRESUPUESTO';

export interface Quote {
  id: string;
  number: string;
  documentTitle: QuoteTitleType;
  issueDate: string;
  validUntilDate: string;
  currency: CurrencyCode;
  estimatedDeliveryTime: string;
  paymentConditions: string;
  projectScope: string;
  emitter: EmitterProfile;
  client: ClientData;
  items: InvoiceItem[];
  taxConfig: TaxConfig;
  totals: InvoiceTotals;
  notes: string;
  primaryColor: string;
  paletteId: PaletteId;
  status: QuoteStatus;
  convertedInvoiceId?: string;
  convertedInvoiceNumber?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}
