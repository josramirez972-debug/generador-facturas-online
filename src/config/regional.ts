import { CurrencyCode } from '../types/invoice';

export interface CountryConfig {
  code: string;
  name: string;
  defaultTaxIdLabel: string;
  taxIdPlaceholder: string;
  defaultTaxLabel: string;
  suggestedCurrency: CurrencyCode;
  cityPlaceholder: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
}

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'CO',
    name: 'Colombia',
    defaultTaxIdLabel: 'NIT',
    taxIdPlaceholder: 'Ej. 901.452.890-1',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'COP',
    cityPlaceholder: 'Ej. Bogotá / Medellín',
    addressPlaceholder: 'Ej. Calle 93 # 14-20, Of. 402',
    phonePlaceholder: '+57 300 123 4567',
  },
  {
    code: 'MX',
    name: 'México',
    defaultTaxIdLabel: 'RFC',
    taxIdPlaceholder: 'Ej. XAXX010101000',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'MXN',
    cityPlaceholder: 'Ej. Ciudad de México / Monterrey',
    addressPlaceholder: 'Ej. Av. Paseo de la Reforma 222, Col. Juárez',
    phonePlaceholder: '+52 55 1234 5678',
  },
  {
    code: 'CL',
    name: 'Chile',
    defaultTaxIdLabel: 'RUT',
    taxIdPlaceholder: 'Ej. 76.123.456-K',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'CLP',
    cityPlaceholder: 'Ej. Santiago / Valparaíso',
    addressPlaceholder: 'Ej. Av. Providencia 1208, Of. 501',
    phonePlaceholder: '+56 9 8765 4321',
  },
  {
    code: 'PE',
    name: 'Perú',
    defaultTaxIdLabel: 'RUC',
    taxIdPlaceholder: 'Ej. 20123456789',
    defaultTaxLabel: 'IGV',
    suggestedCurrency: 'PEN',
    cityPlaceholder: 'Ej. Lima / Arequipa',
    addressPlaceholder: 'Ej. Av. Javier Prado Este 450, San Isidro',
    phonePlaceholder: '+51 987 654 321',
  },
  {
    code: 'AR',
    name: 'Argentina',
    defaultTaxIdLabel: 'CUIT',
    taxIdPlaceholder: 'Ej. 30-71234567-9',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'ARS',
    cityPlaceholder: 'Ej. Buenos Aires / Córdoba',
    addressPlaceholder: 'Ej. Av. Corrientes 1234, Piso 4, CABA',
    phonePlaceholder: '+54 9 11 2345-6789',
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    defaultTaxIdLabel: 'EIN / Tax ID',
    taxIdPlaceholder: 'Ej. 12-3456789',
    defaultTaxLabel: 'Sales Tax',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. Miami, FL / Austin, TX',
    addressPlaceholder: 'Ej. 1200 Brickell Ave, Suite 1950',
    phonePlaceholder: '+1 (305) 555-0199',
  },
  {
    code: 'ES',
    name: 'España',
    defaultTaxIdLabel: 'NIF / CIF',
    taxIdPlaceholder: 'Ej. B12345678',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'EUR',
    cityPlaceholder: 'Ej. Madrid / Barcelona',
    addressPlaceholder: 'Ej. Paseo de la Castellana 89, 28046',
    phonePlaceholder: '+34 600 123 456',
  },
  {
    code: 'EC',
    name: 'Ecuador',
    defaultTaxIdLabel: 'RUC',
    taxIdPlaceholder: 'Ej. 1790012345001',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. Quito / Guayaquil',
    addressPlaceholder: 'Ej. Av. República del Salvador N34-12',
    phonePlaceholder: '+593 99 123 4567',
  },
  {
    code: 'PA',
    name: 'Panamá',
    defaultTaxIdLabel: 'RUC',
    taxIdPlaceholder: 'Ej. 1556789-1-123456 DV 45',
    defaultTaxLabel: 'ITBMS',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. Ciudad de Panamá',
    addressPlaceholder: 'Ej. Calle 50, Torre Global, Piso 12',
    phonePlaceholder: '+507 6123-4567',
  },
  {
    code: 'UY',
    name: 'Uruguay',
    defaultTaxIdLabel: 'RUT',
    taxIdPlaceholder: 'Ej. 211234560018',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. Montevideo / Punta del Este',
    addressPlaceholder: 'Ej. Av. 18 de Julio 1234, Of. 302',
    phonePlaceholder: '+598 99 123 456',
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    defaultTaxIdLabel: 'Cédula Jurídica',
    taxIdPlaceholder: 'Ej. 3-101-123456',
    defaultTaxLabel: 'IVA',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. San José / Escazú',
    addressPlaceholder: 'Ej. Oficentro Ejecutivo Sabana Sur, Torre 2',
    phonePlaceholder: '+506 8888-8888',
  },
  {
    code: 'DO',
    name: 'República Dominicana',
    defaultTaxIdLabel: 'RNC',
    taxIdPlaceholder: 'Ej. 1-30-12345-6',
    defaultTaxLabel: 'ITBIS',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ej. Santo Domingo / Santiago',
    addressPlaceholder: 'Ej. Av. Winston Churchill 1099, Piantini',
    phonePlaceholder: '+1 (809) 555-0123',
  },
  {
    code: 'INTL',
    name: 'Otro país / Internacional',
    defaultTaxIdLabel: 'Identificación tributaria',
    taxIdPlaceholder: 'Ej. ID Fiscal / Tax ID / Registro',
    defaultTaxLabel: 'Impuesto',
    suggestedCurrency: 'USD',
    cityPlaceholder: 'Ciudad / Provincia',
    addressPlaceholder: 'Dirección comercial completa',
    phonePlaceholder: '+00 000 000 0000',
  },
];

export const TAX_ID_LABEL_SUGGESTIONS = [
  'Identificación tributaria',
  'NIT',
  'RUT',
  'RFC',
  'RUC',
  'CUIT',
  'NIF / CIF',
  'Tax ID / EIN',
  'Identificación fiscal',
];

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'Dólar estadounidense',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'es-ES',
    decimals: 2,
  },
  COP: {
    code: 'COP',
    name: 'Peso colombiano',
    symbol: '$',
    locale: 'es-CO',
    decimals: 0,
  },
  MXN: {
    code: 'MXN',
    name: 'Peso mexicano',
    symbol: '$',
    locale: 'es-MX',
    decimals: 2,
  },
  PEN: {
    code: 'PEN',
    name: 'Sol peruano',
    symbol: 'S/',
    locale: 'es-PE',
    decimals: 2,
  },
  CLP: {
    code: 'CLP',
    name: 'Peso chileno',
    symbol: '$',
    locale: 'es-CL',
    decimals: 0,
  },
  ARS: {
    code: 'ARS',
    name: 'Peso argentino',
    symbol: '$',
    locale: 'es-AR',
    decimals: 2,
  },
};

export const CURRENCY_LIST: CurrencyConfig[] = Object.values(CURRENCIES);

export function getCountryConfig(countryNameOrCode: string): CountryConfig {
  return (
    COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === countryNameOrCode.toLowerCase() ||
        c.code.toLowerCase() === countryNameOrCode.toLowerCase()
    ) || COUNTRIES[COUNTRIES.length - 1]
  );
}
