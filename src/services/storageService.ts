import { ClientData, EmitterProfile, Invoice, Quote } from '../types/invoice';
import { calculateInvoiceTotals } from '../utils/calculations';
import {
  generateNextInvoiceNumber,
  generateNextQuoteNumber,
} from '../utils/formatters';

const STORAGE_KEYS = {
  INVOICES: 'gfo_invoices_v1',
  QUOTES: 'gfo_quotes_v1',
  EMITTER: 'gfo_emitter_profile_v1',
  CLIENTS: 'gfo_saved_clients_v1',
};

export const DEFAULT_EMITTER: EmitterProfile = {
  id: 'emitter-default',
  name: 'Estudio Digital & Consultoría',
  companyName: '',
  activity: 'Desarrollo Web Full-Stack & Diseño de Producto',
  email: 'contacto@estudiodigital.co',
  phone: '+57 310 450 8890',
  taxIdLabel: 'NIT',
  taxId: '901.584.210-4',
  city: 'Medellín',
  country: 'Colombia',
  address: 'Cra. 43A # 14-57, El Poblado',
  logoDataUrl: null,
  primaryColor: '#111111',
  selectedPaletteId: 'minimalist',
};

export function createInitialSampleInvoices(): Invoice[] {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const items1 = [
    {
      id: 'item-sample-1',
      concept: 'Diseño y desarrollo de sitio web corporativo',
      description: 'Arquitectura UI/UX, desarrollo frontend optimizado, versión responsive y despliegue en producción.',
      quantity: 1,
      unitPrice: 1200,
      discountPercent: 0,
      taxPercent: 0,
    },
    {
      id: 'item-sample-2',
      concept: 'Optimización SEO técnico y performance web',
      description: 'Auditoría Core Web Vitals, metadatos estructurados y configuración de indexación.',
      quantity: 1,
      unitPrice: 350,
      discountPercent: 0,
      taxPercent: 0,
    },
  ];

  const taxConfig1 = { enabled: false, label: 'IVA', defaultRate: 0 };

  const sample1: Invoice = {
    id: 'inv-sample-1',
    number: `FAC-${new Date().getFullYear()}-0001`,
    issueDate: today,
    dueDate: due,
    currency: 'USD',
    paymentMethod: 'Transferencia Bancaria Internacional / Wise',
    emitter: { ...DEFAULT_EMITTER },
    client: {
      id: 'client-sample-1',
      name: 'NovaTech Global Group LLC',
      companyName: 'NovaTech Global Group LLC',
      taxIdLabel: 'EIN / Tax ID',
      taxId: '88-4120954',
      email: 'billing@novatech.io',
      address: '1200 Brickell Ave, Suite 1950',
      city: 'Miami, FL',
      country: 'Estados Unidos',
    },
    items: items1,
    taxConfig: taxConfig1,
    totals: calculateInvoiceTotals(items1, taxConfig1),
    notes: 'Gracias por confiar en nuestros servicios. El pago debe realizarse dentro de los 15 días posteriores a la fecha de emisión.',
    primaryColor: '#111111',
    paletteId: 'minimalist',
    status: 'generated',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  };

  return [sample1];
}

export function loadEmitterProfile(): EmitterProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMITTER);
    if (!raw) return DEFAULT_EMITTER;
    return { ...DEFAULT_EMITTER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMITTER;
  }
}

export function saveEmitterProfile(profile: EmitterProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMITTER, JSON.stringify(profile));
  } catch (err) {
    console.error('Error guardando perfil del emisor:', err);
  }
}

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      const initial = createInitialSampleInvoices();
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return createInitialSampleInvoices();
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (err) {
    console.error('Error guardando facturas:', err);
  }
}

export function loadSavedClients(): ClientData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClientToDirectory(client: ClientData): ClientData[] {
  const existing = loadSavedClients();
  if (!client.name.trim()) return existing;

  const idxByName = existing.findIndex(
    (c) => c.name.trim().toLowerCase() === client.name.trim().toLowerCase()
  );
  const idxById = existing.findIndex((c) => c.id === client.id);

  let updated: ClientData[];
  if (idxByName >= 0) {
    updated = [...existing];
    updated[idxByName] = { ...client, id: existing[idxByName].id };
  } else if (
    idxById >= 0 &&
    existing[idxById].name.trim().toLowerCase() === client.name.trim().toLowerCase()
  ) {
    updated = [...existing];
    updated[idxById] = { ...client };
  } else {
    const newId =
      idxById >= 0 ? `cli-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` : client.id || `cli-${Date.now()}`;
    updated = [{ ...client, id: newId }, ...existing];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated.slice(0, 50)));
  } catch {
    // ignore storage errors
  }
  return updated;
}

export function deleteClientFromDirectory(clientId: string): ClientData[] {
  const existing = loadSavedClients();
  const updated = existing.filter((c) => c.id !== clientId);
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
  return updated;
}

export function createBlankInvoice(
  emitter: EmitterProfile,
  existingInvoices: Invoice[]
): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const nextNumber = generateNextInvoiceNumber(existingInvoices.map((i) => i.number));

  const initialItems = [
    {
      id: `item-${Date.now()}-1`,
      concept: 'Diseño y desarrollo de landing page',
      description: 'Diseño de interfaz a medida, maquetación responsive y optimización de conversión.',
      quantity: 1,
      unitPrice: 100,
      discountPercent: 0,
      taxPercent: 0,
    },
  ];

  const initialTaxConfig = {
    enabled: false,
    label: 'IVA',
    defaultRate: 19,
  };

  return {
    id: `inv-${Date.now()}`,
    number: nextNumber,
    issueDate: today,
    dueDate: due,
    currency: 'USD',
    paymentMethod: 'Transferencia bancaria',
    emitter: { ...emitter },
    client: {
      id: `cli-${Date.now()}`,
      name: '',
      companyName: '',
      taxIdLabel: 'NIT',
      taxId: '',
      email: '',
      address: '',
      city: '',
      country: 'Colombia',
    },
    items: initialItems,
    taxConfig: initialTaxConfig,
    totals: calculateInvoiceTotals(initialItems, initialTaxConfig),
    notes: 'Gracias por confiar en nuestros servicios.',
    primaryColor: emitter.primaryColor || '#111111',
    paletteId: emitter.selectedPaletteId || 'minimalist',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createInitialSampleQuotes(): Quote[] {
  const today = new Date().toISOString().slice(0, 10);
  const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const items1 = [
    {
      id: 'q-item-sample-1',
      concept: 'Rediseño integral de plataforma e-commerce y UX',
      description: 'Investigación de usuarios, sistema de diseño en Figma y desarrollo frontend de alta conversión.',
      quantity: 1,
      unitPrice: 1850,
      discountPercent: 0,
      taxPercent: 0,
    },
    {
      id: 'q-item-sample-2',
      concept: 'Integración de pasarela de pagos internacional',
      description: 'Configuración de webhooks, pruebas en entorno sandbox y salida a producción.',
      quantity: 1,
      unitPrice: 450,
      discountPercent: 0,
      taxPercent: 0,
    },
  ];

  const taxConfig1 = { enabled: false, label: 'IVA', defaultRate: 0 };

  const sampleQuote: Quote = {
    id: 'quo-sample-1',
    number: `COT-${new Date().getFullYear()}-0001`,
    documentTitle: 'COTIZACIÓN',
    issueDate: today,
    validUntilDate: validUntil,
    currency: 'USD',
    estimatedDeliveryTime: '3 a 4 semanas hábiles',
    paymentConditions: '50% de anticipo al aprobar la cotización y 50% contra entrega final.',
    projectScope:
      'Incluye diseño UI/UX completo para escritorio y móvil, maquetación responsive, integración de pasarela de pagos y 15 días de soporte post-lanzamiento.',
    emitter: { ...DEFAULT_EMITTER },
    client: {
      id: 'client-sample-2',
      name: 'Grupo Editorial Aurora S.A.S.',
      companyName: 'Grupo Editorial Aurora S.A.S.',
      taxIdLabel: 'NIT',
      taxId: '900.812.340-9',
      email: 'proyectos@editorialaurora.com',
      address: 'Av. El Dorado # 68C-61, Of. 504',
      city: 'Bogotá',
      country: 'Colombia',
    },
    items: items1,
    taxConfig: taxConfig1,
    totals: calculateInvoiceTotals(items1, taxConfig1),
    notes: 'Esta propuesta comercial tiene validez hasta la fecha de vencimiento indicada. No representa un documento fiscal.',
    primaryColor: '#1E3A5F',
    paletteId: 'professional-blue',
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  };

  return [sampleQuote];
}

export function loadQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!raw) {
      const initial = createInitialSampleQuotes();
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return createInitialSampleQuotes();
  }
}

export function saveQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (err) {
    console.error('Error guardando cotizaciones:', err);
  }
}

export function createBlankQuote(
  emitter: EmitterProfile,
  existingQuotes: Quote[]
): Quote {
  const today = new Date().toISOString().slice(0, 10);
  const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const nextNumber = generateNextQuoteNumber(existingQuotes.map((q) => q.number));

  const initialItems = [
    {
      id: `q-item-${Date.now()}-1`,
      concept: 'Desarrollo de aplicación web a medida',
      description: 'Diseño de arquitectura, interfaz de usuario responsive y despliegue inicial.',
      quantity: 1,
      unitPrice: 500,
      discountPercent: 0,
      taxPercent: 0,
    },
  ];

  const initialTaxConfig = {
    enabled: false,
    label: 'IVA',
    defaultRate: 19,
  };

  return {
    id: `quo-${Date.now()}`,
    number: nextNumber,
    documentTitle: 'COTIZACIÓN',
    issueDate: today,
    validUntilDate: validUntil,
    currency: 'USD',
    estimatedDeliveryTime: '2 semanas',
    paymentConditions: '50% al iniciar el proyecto, 50% al finalizar.',
    projectScope: 'Entrega de código fuente, diseño adaptativo para móviles y escritorio, y sesión de entrega.',
    emitter: { ...emitter },
    client: {
      id: `cli-${Date.now()}`,
      name: '',
      companyName: '',
      taxIdLabel: 'NIT',
      taxId: '',
      email: '',
      address: '',
      city: '',
      country: 'Colombia',
    },
    items: initialItems,
    taxConfig: initialTaxConfig,
    totals: calculateInvoiceTotals(initialItems, initialTaxConfig),
    notes: 'Propuesta sujeta a los términos y alcance descritos en este documento.',
    primaryColor: emitter.primaryColor || '#111111',
    paletteId: emitter.selectedPaletteId || 'minimalist',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function convertQuoteToInvoiceEntity(
  quote: Quote,
  existingInvoices: Invoice[]
): { newInvoice: Invoice; updatedQuote: Quote } {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const nextInvoiceNum = generateNextInvoiceNumber(existingInvoices.map((i) => i.number));

  const copiedItems = quote.items.map((item, idx) => ({
    ...item,
    id: `inv-item-${Date.now()}-${idx}`,
  }));

  const copiedTaxConfig = { ...quote.taxConfig };
  const verifiedTotals = calculateInvoiceTotals(copiedItems, copiedTaxConfig);

  const combinedNotes = [
    quote.notes,
    quote.number ? `Generada a partir de la cotización ${quote.number}.` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const newInvoiceId = `inv-${Date.now()}`;

  const newInvoice: Invoice = {
    id: newInvoiceId,
    number: nextInvoiceNum,
    issueDate: today,
    dueDate: due,
    currency: quote.currency,
    paymentMethod: quote.paymentConditions || 'Transferencia bancaria',
    emitter: { ...quote.emitter },
    client: { ...quote.client },
    items: copiedItems,
    taxConfig: copiedTaxConfig,
    totals: verifiedTotals,
    notes: combinedNotes,
    primaryColor: quote.primaryColor,
    paletteId: quote.paletteId,
    status: 'generated',
    sourceQuoteId: quote.id,
    sourceQuoteNumber: quote.number,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedQuote: Quote = {
    ...quote,
    status: 'converted',
    convertedInvoiceId: newInvoiceId,
    convertedInvoiceNumber: nextInvoiceNum,
    convertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { newInvoice, updatedQuote };
}
