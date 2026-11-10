import { Invoice, Quote } from '../types/invoice';

export interface ValidationIssue {
  field: string;
  section: 'emitter' | 'client' | 'invoice' | 'items';
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeText(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  if (!email.trim()) return true; // Optional emails validated only if filled, or checked separately if required
  return EMAIL_REGEX.test(email.trim());
}

export function validateInvoice(invoice: Invoice): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Emisor
  if (!invoice.emitter.name.trim()) {
    issues.push({
      field: 'emitter.name',
      section: 'emitter',
      message: 'Introduce el nombre completo o razón social de tu negocio para continuar.',
    });
  }

  if (invoice.emitter.email.trim() && !isValidEmail(invoice.emitter.email)) {
    issues.push({
      field: 'emitter.email',
      section: 'emitter',
      message: 'El correo electrónico del emisor no tiene un formato válido (ejemplo: hola@estudio.com).',
    });
  }

  // Cliente
  if (!invoice.client.name.trim()) {
    issues.push({
      field: 'client.name',
      section: 'client',
      message: 'Introduce el nombre del cliente o empresa para continuar.',
    });
  }

  if (invoice.client.email.trim() && !isValidEmail(invoice.client.email)) {
    issues.push({
      field: 'client.email',
      section: 'client',
      message: 'El correo electrónico del cliente no tiene un formato válido.',
    });
  }

  // Información de factura
  if (!invoice.number.trim()) {
    issues.push({
      field: 'invoice.number',
      section: 'invoice',
      message: 'Especifica un número de factura válido (por ejemplo: FAC-2026-0001).',
    });
  }

  if (!invoice.issueDate.trim()) {
    issues.push({
      field: 'invoice.issueDate',
      section: 'invoice',
      message: 'Selecciona la fecha de emisión de la factura.',
    });
  }

  // Conceptos
  if (!invoice.items || invoice.items.length === 0) {
    issues.push({
      field: 'items',
      section: 'items',
      message: 'Agrega al menos un servicio o producto a la factura.',
    });
  } else {
    invoice.items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.concept.trim()) {
        issues.push({
          field: `items.${item.id}.concept`,
          section: 'items',
          message: `Introduce el nombre del concepto en la línea #${rowNum}.`,
        });
      }
      if (Number(item.quantity) <= 0 || Number.isNaN(Number(item.quantity))) {
        issues.push({
          field: `items.${item.id}.quantity`,
          section: 'items',
          message: `La cantidad en "${item.concept || `Línea #${rowNum}`}" debe ser mayor a 0.`,
        });
      }
      if (Number(item.unitPrice) < 0 || Number.isNaN(Number(item.unitPrice))) {
        issues.push({
          field: `items.${item.id}.unitPrice`,
          section: 'items',
          message: `El precio unitario en "${item.concept || `Línea #${rowNum}`}" no puede ser negativo.`,
        });
      }
      if (Number(item.discountPercent) < 0 || Number(item.discountPercent) > 100) {
        issues.push({
          field: `items.${item.id}.discountPercent`,
          section: 'items',
          message: `El descuento en "${item.concept || `Línea #${rowNum}`}" debe estar entre 0% y 100%.`,
        });
      }
      if (
        invoice.taxConfig.enabled &&
        (Number(item.taxPercent) < 0 || Number(item.taxPercent) > 100)
      ) {
        issues.push({
          field: `items.${item.id}.taxPercent`,
          section: 'items',
          message: `El porcentaje de impuesto en "${item.concept || `Línea #${rowNum}`}" debe estar entre 0% y 100%.`,
        });
      }
    });
  }

  return issues;
}

export function validateQuote(quote: Quote): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!quote.emitter.name.trim()) {
    issues.push({
      field: 'emitter.name',
      section: 'emitter',
      message: 'Introduce el nombre completo o razón social de tu negocio para continuar.',
    });
  }

  if (quote.emitter.email.trim() && !isValidEmail(quote.emitter.email)) {
    issues.push({
      field: 'emitter.email',
      section: 'emitter',
      message: 'El correo electrónico del emisor no tiene un formato válido.',
    });
  }

  if (!quote.client.name.trim()) {
    issues.push({
      field: 'client.name',
      section: 'client',
      message: 'Introduce el nombre del cliente o empresa para continuar.',
    });
  }

  if (quote.client.email.trim() && !isValidEmail(quote.client.email)) {
    issues.push({
      field: 'client.email',
      section: 'client',
      message: 'El correo electrónico del cliente no tiene un formato válido.',
    });
  }

  if (!quote.number.trim()) {
    issues.push({
      field: 'quote.number',
      section: 'invoice',
      message: 'Especifica un número de cotización válido (por ejemplo: COT-2026-0001).',
    });
  }

  if (!quote.issueDate.trim()) {
    issues.push({
      field: 'quote.issueDate',
      section: 'invoice',
      message: 'Selecciona la fecha de emisión de la cotización.',
    });
  }

  if (!quote.items || quote.items.length === 0) {
    issues.push({
      field: 'items',
      section: 'items',
      message: 'Agrega al menos un servicio o producto a la cotización.',
    });
  } else {
    quote.items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.concept.trim()) {
        issues.push({
          field: `items.${item.id}.concept`,
          section: 'items',
          message: `Introduce el nombre del concepto en la línea #${rowNum}.`,
        });
      }
      if (Number(item.quantity) <= 0 || Number.isNaN(Number(item.quantity))) {
        issues.push({
          field: `items.${item.id}.quantity`,
          section: 'items',
          message: `La cantidad en "${item.concept || `Línea #${rowNum}`}" debe ser mayor a 0.`,
        });
      }
      if (Number(item.unitPrice) < 0 || Number.isNaN(Number(item.unitPrice))) {
        issues.push({
          field: `items.${item.id}.unitPrice`,
          section: 'items',
          message: `El precio unitario en "${item.concept || `Línea #${rowNum}`}" no puede ser negativo.`,
        });
      }
      if (Number(item.discountPercent) < 0 || Number(item.discountPercent) > 100) {
        issues.push({
          field: `items.${item.id}.discountPercent`,
          section: 'items',
          message: `El descuento en "${item.concept || `Línea #${rowNum}`}" debe estar entre 0% y 100%.`,
        });
      }
      if (
        quote.taxConfig.enabled &&
        (Number(item.taxPercent) < 0 || Number(item.taxPercent) > 100)
      ) {
        issues.push({
          field: `items.${item.id}.taxPercent`,
          section: 'items',
          message: `El porcentaje de impuesto en "${item.concept || `Línea #${rowNum}`}" debe estar entre 0% y 100%.`,
        });
      }
    });
  }

  return issues;
}

const ALLOWED_LOGO_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_LOGO_MIMES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no compatible. Sube una imagen en formato PNG, JPG o SVG.',
    };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'El archivo supera el tamaño máximo permitido de 2 MB. Por favor elige un logo más ligero.',
    };
  }

  return { valid: true };
}
