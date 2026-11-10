import React, { forwardRef } from 'react';
import { Quote } from '../../types/invoice';
import { getPaletteById } from '../../config/palettes';
import { calculateLineAmounts } from '../../utils/calculations';
import { formatCurrencyAmount, formatDisplayDate } from '../../utils/formatters';

interface QuoteDocumentProps {
  quote: Quote;
  isExporting?: boolean;
}

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(
  ({ quote }, ref) => {
    const palette = getPaletteById(quote.paletteId);
    const primaryColor = quote.primaryColor || palette.primary || '#111111';
    const lightSurface = palette.lightSurface || '#F3F3F3';

    const { emitter, client, items, totals, taxConfig, currency } = quote;
    const docTitle = quote.documentTitle || 'COTIZACIÓN';

    return (
      <div
        ref={ref}
        id="quote-pdf-sheet"
        className="bg-white text-[#111111] w-full max-w-[794px] mx-auto shadow-sm print:shadow-none"
        style={{
          minHeight: '1122px',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxSizing: 'border-box',
        }}
      >
        {/* Top accent bar with subtle double-line distinction for quotes */}
        <div
          style={{
            height: '6px',
            backgroundColor: primaryColor,
            width: '100%',
          }}
        />
        <div
          style={{
            height: '2px',
            backgroundColor: primaryColor,
            opacity: 0.25,
            width: '100%',
            marginTop: '2px',
          }}
        />

        <div
          className="p-8 sm:p-12 flex flex-col justify-between"
          style={{ minHeight: '1112px' }}
        >
          <div>
            {/* 1. ENCABEZADO */}
            <header className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-neutral-200">
              {/* Emisor (Izquierda) */}
              <div className="space-y-2 max-w-[60%]">
                {emitter.logoDataUrl ? (
                  <div className="mb-3">
                    <img
                      src={emitter.logoDataUrl}
                      alt={emitter.name || 'Logo'}
                      className="max-h-14 max-w-[200px] object-contain"
                    />
                  </div>
                ) : null}

                <div>
                  <h1
                    className="text-xl font-bold tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    {emitter.name || 'Nombre del Profesional o Empresa'}
                  </h1>
                  {emitter.activity && (
                    <p className="text-xs font-medium text-neutral-600 mt-0.5">
                      {emitter.activity}
                    </p>
                  )}
                </div>

                <div className="text-xs text-neutral-600 space-y-0.5 pt-1 leading-relaxed">
                  {emitter.taxId && (
                    <p>
                      <span className="font-semibold text-neutral-800">
                        {emitter.taxIdLabel || 'Identificación tributaria'}:
                      </span>{' '}
                      {emitter.taxId}
                    </p>
                  )}
                  {emitter.address && <p>{emitter.address}</p>}
                  {(emitter.city || emitter.country) && (
                    <p>
                      {[emitter.city, emitter.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {(emitter.email || emitter.phone) && (
                    <p className="pt-0.5 text-neutral-500">
                      {[emitter.email, emitter.phone].filter(Boolean).join('  •  ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Datos de Cotización (Derecha) */}
              <div className="sm:text-right flex flex-col sm:items-end justify-start">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded mb-1"
                  style={{
                    backgroundColor: lightSurface,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                  }}
                >
                  Propuesta Comercial
                </span>
                <span
                  className="text-2xl sm:text-3xl font-bold tracking-widest uppercase"
                  style={{ color: primaryColor }}
                >
                  {docTitle}
                </span>
                <p className="text-sm font-mono font-semibold text-neutral-900 mt-1">
                  {quote.number || 'COT-0001'}
                </p>

                <div
                  className="mt-4 rounded-lg px-4 py-2.5 text-xs space-y-1 border border-neutral-200/80"
                  style={{ backgroundColor: lightSurface }}
                >
                  <div className="flex justify-between sm:justify-end gap-4">
                    <span className="text-neutral-500">Fecha de emisión:</span>
                    <span className="font-semibold text-neutral-900">
                      {formatDisplayDate(quote.issueDate)}
                    </span>
                  </div>
                  {quote.validUntilDate && (
                    <div className="flex justify-between sm:justify-end gap-4">
                      <span className="text-neutral-500">Válida hasta:</span>
                      <span className="font-semibold text-neutral-900">
                        {formatDisplayDate(quote.validUntilDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between sm:justify-end gap-4">
                    <span className="text-neutral-500">Moneda:</span>
                    <span className="font-semibold text-neutral-900">{currency}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* 2. CLIENTE Y TIEMPO DE EJECUCIÓN */}
            <section className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 border-b border-neutral-200">
              <div className="sm:col-span-7 space-y-1.5">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: primaryColor }}
                >
                  PREPARADO PARA
                </p>
                <h2 className="text-base font-bold text-neutral-900">
                  {client.name || 'Nombre del cliente o empresa'}
                </h2>
                {client.companyName &&
                  client.companyName.toLowerCase() !== client.name.toLowerCase() && (
                    <p className="text-xs font-medium text-neutral-700">
                      {client.companyName}
                    </p>
                  )}
                <div className="text-xs text-neutral-600 space-y-0.5 pt-0.5 leading-relaxed">
                  {client.taxId && (
                    <p>
                      <span className="font-semibold text-neutral-800">
                        {client.taxIdLabel || 'Identificación tributaria'}:
                      </span>{' '}
                      {client.taxId}
                    </p>
                  )}
                  {client.address && <p>{client.address}</p>}
                  {(client.city || client.country) && (
                    <p>{[client.city, client.country].filter(Boolean).join(', ')}</p>
                  )}
                  {client.email && <p className="text-neutral-500">{client.email}</p>}
                </div>
              </div>

              <div className="sm:col-span-5 sm:text-right flex flex-col justify-between space-y-3">
                {quote.estimatedDeliveryTime ? (
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      TIEMPO ESTIMADO DE EJECUCIÓN
                    </p>
                    <p className="text-xs font-semibold text-neutral-800 mt-1">
                      {quote.estimatedDeliveryTime}
                    </p>
                  </div>
                ) : (
                  <div />
                )}

                <div className="pt-1">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                    Inversión total estimada
                  </p>
                  <p
                    className="text-lg font-bold font-mono mt-0.5"
                    style={{ color: primaryColor }}
                  >
                    {formatCurrencyAmount(totals.grandTotal, currency, true)}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. ALCANCE DEL PROYECTO (SI EXISTE) */}
            {quote.projectScope && (
              <section className="pt-5 pb-2 avoid-page-break">
                <div
                  className="rounded-lg p-4 border border-neutral-200/90"
                  style={{ backgroundColor: lightSurface }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: primaryColor }}
                  >
                    Alcance del proyecto
                  </p>
                  <p className="text-xs text-neutral-700 whitespace-pre-line leading-relaxed">
                    {quote.projectScope}
                  </p>
                </div>
              </section>
            )}

            {/* 4. TABLA DE SERVICIOS / CONCEPTOS COTIZADOS */}
            <section className="py-5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{
                      backgroundColor: lightSurface,
                      borderBottom: `2px solid ${primaryColor}`,
                    }}
                  >
                    <th
                      className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Concepto / Entregable
                    </th>
                    <th
                      className="py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-right w-16"
                      style={{ color: primaryColor }}
                    >
                      Cant.
                    </th>
                    <th
                      className="py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-right w-28"
                      style={{ color: primaryColor }}
                    >
                      Precio
                    </th>
                    <th
                      className="py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-right w-20"
                      style={{ color: primaryColor }}
                    >
                      Desc.
                    </th>
                    {taxConfig.enabled && (
                      <th
                        className="py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-right w-20"
                        style={{ color: primaryColor }}
                      >
                        {taxConfig.label || 'Imp.'}
                      </th>
                    )}
                    <th
                      className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-right w-32"
                      style={{ color: primaryColor }}
                    >
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs">
                  {items.map((item, index) => {
                    const line = calculateLineAmounts(item, taxConfig.enabled);
                    return (
                      <tr key={item.id || index} className="avoid-page-break align-top">
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-neutral-900">
                            {item.concept || 'Concepto sin título'}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed whitespace-pre-line">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-neutral-700">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-neutral-700">
                          {formatCurrencyAmount(item.unitPrice, currency, false)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-neutral-600">
                          {item.discountPercent > 0 ? `${item.discountPercent}%` : '0%'}
                        </td>
                        {taxConfig.enabled && (
                          <td className="py-3.5 px-2 text-right font-mono text-neutral-600">
                            {item.taxPercent > 0 ? `${item.taxPercent}%` : '0%'}
                          </td>
                        )}
                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-neutral-900">
                          {formatCurrencyAmount(line.lineTotal, currency, false)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* 5. CONDICIONES COMERCIALES, NOTAS Y DESGLOSE ECONÓMICO */}
            <section className="pt-2 pb-6 flex flex-col sm:flex-row justify-between items-start gap-8 avoid-page-break">
              {/* Condiciones de pago y notas */}
              <div className="w-full sm:w-7/12 space-y-3">
                {quote.paymentConditions && (
                  <div
                    className="rounded-lg p-3.5 border border-neutral-200/80"
                    style={{ backgroundColor: lightSurface }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: primaryColor }}
                    >
                      Condiciones de pago
                    </p>
                    <p className="text-xs text-neutral-700 whitespace-pre-line leading-relaxed">
                      {quote.paymentConditions}
                    </p>
                  </div>
                )}

                {quote.notes && (
                  <div className="rounded-lg p-3.5 border border-neutral-200/80 bg-white">
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: primaryColor }}
                    >
                      Notas adicionales y validez
                    </p>
                    <p className="text-xs text-neutral-600 whitespace-pre-line leading-relaxed">
                      {quote.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Resumen Totales */}
              <div className="w-full sm:w-5/12 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 px-2 text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    {formatCurrencyAmount(totals.subtotal, currency, true)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 px-2 text-neutral-600">
                  <span>Descuentos:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    {totals.discountTotal > 0
                      ? `- ${formatCurrencyAmount(totals.discountTotal, currency, false)}`
                      : formatCurrencyAmount(0, currency, false)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 px-2 text-neutral-600">
                  <span>
                    {taxConfig.enabled
                      ? `Impuestos (${taxConfig.label || 'Impuesto'}):`
                      : 'Impuestos (No aplica):'}
                  </span>
                  <span className="font-mono font-medium text-neutral-900">
                    {taxConfig.enabled
                      ? formatCurrencyAmount(totals.taxTotal, currency, false)
                      : formatCurrencyAmount(0, currency, false)}
                  </span>
                </div>

                <div
                  className="flex justify-between items-center py-3 px-3.5 rounded-lg text-white mt-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">
                    TOTAL COTIZADO
                  </span>
                  <span className="text-base font-mono font-bold">
                    {formatCurrencyAmount(totals.grandTotal, currency, true)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* 6. PIE DE DOCUMENTO — DIFERENCIACIÓN CLARA DE PROPUESTA COMERCIAL NO FISCAL */}
          <footer className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-neutral-400 avoid-page-break">
            <p>
              {docTitle === 'PRESUPUESTO' ? 'Presupuesto comercial' : 'Cotización comercial'}{' '}
              emitida por{' '}
              <span className="font-medium text-neutral-600">
                {emitter.name || 'Emisor'}
              </span>
              {quote.validUntilDate
                ? ` · Válida hasta el ${formatDisplayDate(quote.validUntilDate)}`
                : ''}
              . Este documento es informativo y no constituye factura ni comprobante fiscal.
            </p>
            <p className="font-mono shrink-0">{quote.number}</p>
          </footer>
        </div>
      </div>
    );
  }
);

QuoteDocument.displayName = 'QuoteDocument';
