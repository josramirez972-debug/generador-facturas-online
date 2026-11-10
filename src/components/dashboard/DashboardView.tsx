import React, { useState, useRef } from 'react';
import {
  Plus,
  FileText,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Settings,
  Palette,
  ArrowUpRight,
  ArrowRightLeft,
  FileSpreadsheet,
  XCircle,
  X,
} from 'lucide-react';
import {
  EmitterProfile,
  Invoice,
  InvoiceStatus,
  Quote,
  QuoteStatus,
} from '../../types/invoice';
import { formatCurrencyAmount, formatDisplayDate } from '../../utils/formatters';
import { InvoiceDocument } from '../preview/InvoiceDocument';
import { QuoteDocument } from '../preview/QuoteDocument';
import { QUOTE_STATUS_CONFIG } from '../quotes/QuotesView';
import { generateAndDownloadInvoicePdf } from '../../services/pdfService';

interface DashboardViewProps {
  invoices: Invoice[];
  quotes?: Quote[];
  emitter: EmitterProfile;
  onCreateNew: () => void;
  onCreateNewQuote?: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onChangeStatus: (id: string, status: InvoiceStatus) => void;
  onEditQuote?: (quote: Quote) => void;
  onDuplicateQuote?: (quote: Quote) => void;
  onDeleteQuote?: (id: string) => void;
  onChangeQuoteStatus?: (id: string, status: QuoteStatus) => void;
  onConvertQuoteToInvoice?: (quote: Quote) => void;
  onNavigateToQuotes?: () => void;
  onOpenSettings: () => void;
  invoicesOnlyMode?: boolean;
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Borrador',
    badgeClass: 'bg-neutral-200/80 text-neutral-700 border-neutral-300',
    icon: <Clock className="w-3 h-3" />,
  },
  generated: {
    label: 'Generada',
    badgeClass: 'bg-neutral-900 text-white border-neutral-900',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  sent: {
    label: 'Enviada',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Send className="w-3 h-3" />,
  },
  paid: {
    label: 'Pagada',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  overdue: {
    label: 'Vencida',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  quotes = [],
  emitter,
  onCreateNew,
  onCreateNewQuote,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onChangeStatus,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onChangeQuoteStatus,
  onConvertQuoteToInvoice,
  onNavigateToQuotes,
  onOpenSettings,
  invoicesOnlyMode = false,
}) => {
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const hiddenExportRef = useRef<HTMLDivElement | null>(null);
  const hiddenQuoteExportRef = useRef<HTMLDivElement | null>(null);
  const [exportTarget, setExportTarget] = useState<Invoice | null>(null);
  const [exportQuoteTarget, setExportQuoteTarget] = useState<Quote | null>(null);

  const totalCount = invoices.length;
  const generatedCount = invoices.filter((i) => i.status !== 'draft').length;
  const draftCount = invoices.filter((i) => i.status === 'draft').length;
  const latestInvoice = invoices[0] || null;

  // Métricas de Cotizaciones
  const totalQuotesCount = quotes.length;
  const pendingQuotesCount = quotes.filter(
    (q) => q.status === 'draft' || q.status === 'sent'
  ).length;
  const acceptedQuotesCount = quotes.filter((q) => q.status === 'accepted').length;
  const convertedQuotesCount = quotes.filter((q) => q.status === 'converted').length;
  const primaryQuoteCurrency = quotes[0]?.currency || 'USD';
  const totalQuotedValue = quotes
    .filter((q) => q.currency === primaryQuoteCurrency)
    .reduce((acc, q) => acc + (q.totals?.grandTotal || 0), 0);

  const handleQuickDownload = async (inv: Invoice) => {
    setDownloadingId(inv.id);
    setExportTarget(inv);

    setTimeout(async () => {
      if (hiddenExportRef.current) {
        try {
          await generateAndDownloadInvoicePdf(hiddenExportRef.current, inv);
        } catch (err) {
          console.error('Error descargando factura:', err);
        }
      }
      setDownloadingId(null);
      setExportTarget(null);
    }, 120);
  };

  const handleQuickDownloadQuote = async (q: Quote) => {
    setDownloadingId(q.id);
    setExportQuoteTarget(q);

    setTimeout(async () => {
      if (hiddenQuoteExportRef.current) {
        try {
          await generateAndDownloadInvoicePdf(hiddenQuoteExportRef.current, q);
        } catch (err) {
          console.error('Error descargando cotización:', err);
        }
      }
      setDownloadingId(null);
      setExportQuoteTarget(null);
    }, 120);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Encabezado del Dashboard */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-700">
            <span>Facturación Comercial Internacional</span>
            <span className="text-neutral-300">•</span>
            <span>COP · USD · EUR · MXN · PEN · CLP · ARS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Generador de Facturas Online
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Introduce tus datos, agrega tu servicio, personaliza tu identidad y descarga tu factura en PDF lista para enviar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Perfil e Identidad</span>
          </button>

          {!invoicesOnlyMode && onCreateNewQuote && (
            <button
              type="button"
              onClick={onCreateNewQuote}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl shadow-2xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Crear nueva cotización</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNew}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#111111] hover:bg-neutral-800 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear nueva factura</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Facturas creadas
            </span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-neutral-950">
              {totalCount}
            </span>
            <span className="text-xs text-neutral-500">
              {generatedCount} generadas · {draftCount} borradores
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col justify-between sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Última factura creada
            </span>
            {latestInvoice && (
              <span className="text-xs font-mono font-semibold text-neutral-800">
                {latestInvoice.number}
              </span>
            )}
          </div>

          {latestInvoice ? (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-neutral-900 truncate">
                  {latestInvoice.client.name || 'Cliente sin especificar'}
                </p>
                <p className="text-xs text-neutral-500">
                  Emitida el {formatDisplayDate(latestInvoice.issueDate)} ·{' '}
                  <span className="font-mono font-semibold text-neutral-800">
                    {formatCurrencyAmount(
                      latestInvoice.totals.grandTotal,
                      latestInvoice.currency,
                      true
                    )}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEditInvoice(latestInvoice)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline self-start sm:self-center"
              >
                <span>Abrir factura</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-neutral-400">
              Aún no has emitido facturas.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Perfil de emisor
            </span>
            <Palette className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="truncate">
              <p className="text-sm font-bold text-neutral-900 truncate">
                {emitter.name || 'Configurar negocio'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {emitter.country} · {emitter.taxIdLabel}: {emitter.taxId || 'Opcional'}
              </p>
            </div>
            <div
              className="w-6 h-6 rounded-full border border-neutral-300 shrink-0"
              style={{ backgroundColor: emitter.primaryColor || '#111111' }}
              title={`Color de marca: ${emitter.primaryColor}`}
            />
          </div>
        </div>
      </div>

      {/* Indicadores de Cotizaciones en el Dashboard */}
      {!invoicesOnlyMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Resumen de cotizaciones y presupuestos
            </h2>
            {onNavigateToQuotes && (
              <button
                type="button"
                onClick={onNavigateToQuotes}
                className="text-xs font-semibold text-neutral-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Ver sección de cotizaciones</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Total de cotizaciones
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-950 mt-2">
                {totalQuotesCount}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Cotizaciones pendientes
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-900 mt-2">
                {pendingQuotesCount}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Cotizaciones aceptadas
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-2">
                {acceptedQuotesCount}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Cotizaciones convertidas
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-950 mt-2">
                {convertedQuotesCount}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Valor total cotizado
              </span>
              <span className="text-lg font-bold font-mono text-neutral-950 mt-2 truncate">
                {formatCurrencyAmount(totalQuotedValue, primaryQuoteCurrency, true)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Listado de Facturas Recientes */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Facturas recientes
            </h2>
            <p className="text-xs text-neutral-500">
              Visualiza, descarga en PDF, duplica o actualiza el estado de tus facturas
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-sm font-bold text-neutral-900">
                Crea tu primera factura profesional
              </h3>
              <p className="text-xs text-neutral-500">
                Personaliza tu logotipo, elige tu moneda y descarga un PDF en formato A4 en menos de un minuto.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear nueva factura
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {invoices.map((inv) => {
              const statusInfo = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
              return (
                <div
                  key={inv.id}
                  className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold shrink-0"
                      style={{ backgroundColor: inv.primaryColor || '#111111' }}
                    >
                      PDF
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-mono font-bold text-neutral-900">
                          {inv.number}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs font-semibold text-neutral-800">
                          {inv.client.name || 'Cliente sin nombre'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <span>Emisión: {formatDisplayDate(inv.issueDate)}</span>
                        {inv.dueDate && (
                          <span>Vence: {formatDisplayDate(inv.dueDate)}</span>
                        )}
                        <span>
                          {inv.items.length}{' '}
                          {inv.items.length === 1 ? 'concepto' : 'conceptos'}
                        </span>
                        <span>País cliente: {inv.client.country}</span>
                        {inv.sourceQuoteNumber && (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            Origen: {inv.sourceQuoteNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    <div className="text-left lg:text-right mr-2">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                        Total
                      </p>
                      <p className="text-sm font-mono font-bold text-neutral-950">
                        {formatCurrencyAmount(inv.totals.grandTotal, inv.currency, true)}
                      </p>
                    </div>

                    {/* Selector de estado rápido */}
                    <select
                      value={inv.status}
                      onChange={(e) =>
                        onChangeStatus(inv.id, e.target.value as InvoiceStatus)
                      }
                      aria-label="Cambiar estado de la factura"
                      className="px-2.5 py-1.5 text-xs font-medium bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:border-neutral-900"
                    >
                      <option value="draft">Estado: Borrador</option>
                      <option value="generated">Estado: Generada</option>
                      <option value="sent">Estado: Enviada</option>
                      <option value="paid">Estado: Pagada</option>
                      <option value="overdue">Estado: Vencida</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Visualizar factura"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Visualizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDownload(inv)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === inv.id ? 'Generando...' : 'Descargar PDF'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Editar factura"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateInvoice(inv)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Duplicar factura"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteInvoice(inv.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 bg-white border border-neutral-200 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar factura"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla de Cotizaciones Recientes en el Dashboard */}
      {!invoicesOnlyMode && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Cotizaciones recientes
              </h2>
              <p className="text-xs text-neutral-500">
                Visualiza, descarga en PDF, cambia el estado o convierte tus cotizaciones aceptadas en facturas
              </p>
            </div>
            {onCreateNewQuote && (
              <button
                type="button"
                onClick={onCreateNewQuote}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear nueva cotización</span>
              </button>
            )}
          </div>

          {quotes.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-neutral-500">
                Aún no tienes cotizaciones registradas.
              </p>
              {onCreateNewQuote && (
                <button
                  type="button"
                  onClick={onCreateNewQuote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear nueva cotización
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {quotes.map((q) => {
                const statusInfo =
                  QUOTE_STATUS_CONFIG[q.status] || QUOTE_STATUS_CONFIG.draft;
                const isConverted =
                  q.status === 'converted' || Boolean(q.convertedInvoiceId);

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold shrink-0"
                        style={{ backgroundColor: q.primaryColor || '#111111' }}
                      >
                        COT
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-mono font-bold text-neutral-900">
                            {q.number}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs font-semibold text-neutral-800">
                            {q.client.name || 'Cliente sin nombre'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                          <span>Emisión: {formatDisplayDate(q.issueDate)}</span>
                          {q.validUntilDate && (
                            <span>Válida hasta: {formatDisplayDate(q.validUntilDate)}</span>
                          )}
                          {q.convertedInvoiceNumber && (
                            <span className="font-mono font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                              Factura: {q.convertedInvoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                      <div className="text-left lg:text-right mr-2">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                          Total cotizado
                        </p>
                        <p className="text-sm font-mono font-bold text-neutral-950">
                          {formatCurrencyAmount(q.totals.grandTotal, q.currency, true)}
                        </p>
                      </div>

                      {q.status === 'accepted' &&
                        !isConverted &&
                        onConvertQuoteToInvoice && (
                          <button
                            type="button"
                            onClick={() => onConvertQuoteToInvoice(q)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Convertir en factura</span>
                          </button>
                        )}

                      {onChangeQuoteStatus && (
                        <select
                          value={q.status}
                          disabled={isConverted}
                          onChange={(e) =>
                            onChangeQuoteStatus(q.id, e.target.value as QuoteStatus)
                          }
                          aria-label="Cambiar estado de la cotización"
                          className="px-2.5 py-1.5 text-xs font-medium bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:border-neutral-900 disabled:opacity-60"
                        >
                          <option value="draft">Estado: Borrador</option>
                          <option value="sent">Estado: Enviada</option>
                          <option value="accepted">Estado: Aceptada</option>
                          <option value="rejected">Estado: Rechazada</option>
                          <option value="expired">Estado: Vencida</option>
                          {isConverted && (
                            <option value="converted">
                              Estado: Convertida en factura
                            </option>
                          )}
                        </select>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewQuote(q)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Visualizar cotización"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Visualizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickDownloadQuote(q)}
                          disabled={downloadingId === q.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>
                            {downloadingId === q.id ? 'Generando...' : 'Descargar PDF'}
                          </span>
                        </button>

                        {onEditQuote && (
                          <button
                            type="button"
                            onClick={() => onEditQuote(q)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Editar cotización"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDuplicateQuote && (
                          <button
                            type="button"
                            onClick={() => onDuplicateQuote(q)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Duplicar cotización"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteQuote && (
                          <button
                            type="button"
                            onClick={() => onDeleteQuote(q.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 bg-white border border-neutral-200 rounded-lg hover:bg-red-50 transition-colors"
                            title="Eliminar cotización"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de previsualización rápida de cotización desde el Dashboard */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-neutral-100 w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-neutral-300">
            <div className="bg-white px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-neutral-900">
                  Vista previa — {previewQuote.number}
                </span>
                <span className="text-xs text-neutral-500">
                  ({previewQuote.client.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewQuote.status === 'accepted' &&
                  !previewQuote.convertedInvoiceId &&
                  onConvertQuoteToInvoice && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewQuote;
                        setPreviewQuote(null);
                        onConvertQuoteToInvoice(target);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Convertir en factura
                    </button>
                  )}
                {onEditQuote && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = previewQuote;
                      setPreviewQuote(null);
                      onEditQuote(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleQuickDownloadQuote(previewQuote)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewQuote(null)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8">
              <QuoteDocument quote={previewQuote} />
            </div>
          </div>
        </div>
      )}

      {exportQuoteTarget && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '794px',
            zIndex: -1,
          }}
        >
          <QuoteDocument ref={hiddenQuoteExportRef} quote={exportQuoteTarget} />
        </div>
      )}

      {/* Modal de previsualización rápida desde el Dashboard */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-neutral-100 w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-neutral-300">
            <div className="bg-white px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-neutral-900">
                  Vista previa — {previewInvoice.number}
                </span>
                <span className="text-xs text-neutral-500">
                  ({previewInvoice.client.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewInvoice;
                    setPreviewInvoice(null);
                    onEditInvoice(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDownload(previewInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8">
              <InvoiceDocument invoice={previewInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* Contenedor fuera de pantalla para descargas directas de PDF desde el Dashboard */}
      {exportTarget && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '794px',
            zIndex: -1,
          }}
        >
          <InvoiceDocument ref={hiddenExportRef} invoice={exportTarget} />
        </div>
      )}
    </div>
  );
};
