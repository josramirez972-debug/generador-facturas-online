import React, { useState, useRef } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { Quote, QuoteStatus } from '../../types/invoice';
import { formatCurrencyAmount, formatDisplayDate } from '../../utils/formatters';
import { QuoteDocument } from '../preview/QuoteDocument';
import { generateAndDownloadInvoicePdf } from '../../services/pdfService';

interface QuotesViewProps {
  quotes: Quote[];
  onCreateNewQuote: () => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onChangeQuoteStatus: (id: string, status: QuoteStatus) => void;
  onConvertQuoteToInvoice: (quote: Quote) => void;
  onOpenConvertedInvoice: (invoiceId: string) => void;
}

export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Borrador',
    badgeClass: 'bg-neutral-200/80 text-neutral-700 border-neutral-300',
    icon: <Clock className="w-3 h-3" />,
  },
  sent: {
    label: 'Enviada',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Send className="w-3 h-3" />,
  },
  accepted: {
    label: 'Aceptada',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rechazada',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    icon: <XCircle className="w-3 h-3" />,
  },
  expired: {
    label: 'Vencida',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  converted: {
    label: 'Convertida en factura',
    badgeClass: 'bg-neutral-900 text-white border-neutral-900',
    icon: <ArrowRightLeft className="w-3 h-3" />,
  },
};

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  onCreateNewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onChangeQuoteStatus,
  onConvertQuoteToInvoice,
  onOpenConvertedInvoice,
}) => {
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exportTarget, setExportTarget] = useState<Quote | null>(null);
  const hiddenExportRef = useRef<HTMLDivElement | null>(null);

  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter(
    (q) => q.status === 'draft' || q.status === 'sent'
  ).length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted').length;
  const convertedQuotes = quotes.filter((q) => q.status === 'converted').length;

  // Agrupar valor total cotizado por moneda principal o mostrar suma en la moneda de la última cotización
  const primaryCurrency = quotes[0]?.currency || 'USD';
  const totalQuotedInPrimary = quotes
    .filter((q) => q.currency === primaryCurrency)
    .reduce((acc, q) => acc + (q.totals?.grandTotal || 0), 0);

  const handleQuickDownload = async (q: Quote) => {
    setDownloadingId(q.id);
    setExportTarget(q);

    setTimeout(async () => {
      if (hiddenExportRef.current) {
        try {
          await generateAndDownloadInvoicePdf(hiddenExportRef.current, q);
        } catch (err) {
          console.error('Error descargando cotización:', err);
        }
      }
      setDownloadingId(null);
      setExportTarget(null);
    }, 120);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado de Cotizaciones */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-700">
            <span>Módulo de Cotizaciones y Presupuestos</span>
            <span className="text-neutral-300">•</span>
            <span>Conversión a factura en 1 clic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Cotizaciones / Presupuestos
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Crea propuestas comerciales profesionales en PDF con alcance del proyecto, tiempos de ejecución y conviértelas automáticamente en facturas cuando tu cliente las apruebe.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewQuote}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#111111] hover:bg-neutral-800 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Crear nueva cotización</span>
        </button>
      </div>

      {/* Indicadores de Cotizaciones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Total cotizaciones
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950 mt-3">
            {totalQuotes}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Pendientes
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900">
              {pendingQuotes}
            </span>
            <span className="text-[11px] text-neutral-400">Borrador / Enviadas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Aceptadas
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
              {acceptedQuotes}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Listas para facturar
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Convertidas
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950">
              {convertedQuotes}
            </span>
            <span className="text-[11px] text-neutral-400">En factura</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Valor total cotizado
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-neutral-950 mt-3 truncate">
            {formatCurrencyAmount(totalQuotedInPrimary, primaryCurrency, true)}
          </span>
        </div>
      </div>

      {/* Tabla / Listado de Cotizaciones Recientes */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Historial de cotizaciones
            </h2>
            <p className="text-xs text-neutral-500">
              Visualiza, descarga en PDF, actualiza el estado o convierte tus cotizaciones aceptadas en facturas
            </p>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-500">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-sm font-bold text-neutral-900">
                Aún no tienes cotizaciones registradas
              </h3>
              <p className="text-xs text-neutral-500">
                Crea tu primera cotización profesional en PDF y conviértela en factura cuando el cliente la acepte.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateNewQuote}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear nueva cotización
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {quotes.map((q) => {
              const statusInfo =
                QUOTE_STATUS_CONFIG[q.status] || QUOTE_STATUS_CONFIG.draft;
              const isConverted = q.status === 'converted' || Boolean(q.convertedInvoiceId);

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
                        {q.estimatedDeliveryTime && (
                          <span>Ejecución: {q.estimatedDeliveryTime}</span>
                        )}
                        {q.convertedInvoiceNumber && q.convertedInvoiceId && (
                          <button
                            type="button"
                            onClick={() => onOpenConvertedInvoice(q.convertedInvoiceId!)}
                            className="inline-flex items-center gap-1 font-mono font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded border border-neutral-300 transition-colors"
                          >
                            <span>Factura: {q.convertedInvoiceNumber}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
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

                    {/* Botón prioritario: Convertir en factura cuando está Aceptada */}
                    {q.status === 'accepted' && !isConverted && (
                      <button
                        type="button"
                        onClick={() => onConvertQuoteToInvoice(q)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Convertir en factura</span>
                      </button>
                    )}

                    {/* Selector de estado */}
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
                        <option value="converted">Estado: Convertida en factura</option>
                      )}
                    </select>

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
                        onClick={() => handleQuickDownload(q)}
                        disabled={downloadingId === q.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === q.id ? 'Generando...' : 'Descargar PDF'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditQuote(q)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Editar cotización"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateQuote(q)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Duplicar cotización"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteQuote(q.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 bg-white border border-neutral-200 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar cotización"
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

      {/* Modal de previsualización rápida */}
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
                {previewQuote.status === 'accepted' && !previewQuote.convertedInvoiceId && (
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
                <button
                  type="button"
                  onClick={() => handleQuickDownload(previewQuote)}
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

      {/* Contenedor fuera de pantalla para descargas directas de PDF */}
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
          <QuoteDocument ref={hiddenExportRef} quote={exportTarget} />
        </div>
      )}
    </div>
  );
};
