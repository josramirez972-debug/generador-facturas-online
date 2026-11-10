import React, { useState, useRef } from 'react';
import {
  Building2,
  Palette,
  UserCheck,
  FileSpreadsheet,
  Briefcase,
  Eye,
  X,
  Download,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  UserPlus,
  BookmarkCheck,
  ArrowRightLeft,
} from 'lucide-react';
import {
  ClientData,
  CurrencyCode,
  EmitterProfile,
  InvoiceItem,
  PaletteId,
  Quote,
  QuoteTitleType,
  TaxConfig,
} from '../../types/invoice';
import {
  COUNTRIES,
  CURRENCY_LIST,
  TAX_ID_LABEL_SUGGESTIONS,
  getCountryConfig,
} from '../../config/regional';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrencyAmount } from '../../utils/formatters';
import { validateQuote, ValidationIssue } from '../../utils/validators';
import { LogoUploader } from './LogoUploader';
import { VisualIdentitySection } from './VisualIdentitySection';
import { LineItemsSection } from './LineItemsSection';
import { QuoteDocument } from '../preview/QuoteDocument';
import { generateAndDownloadInvoicePdf } from '../../services/pdfService';

interface QuoteEditorProps {
  initialQuote: Quote;
  savedClients: ClientData[];
  onSaveQuote: (quote: Quote, markSent?: boolean) => void;
  onConvertQuoteToInvoice?: (quote: Quote) => void;
  onOpenConvertedInvoice?: (invoiceId: string) => void;
  onSaveClientDirect?: (client: ClientData) => void;
  onDeleteSavedClient?: (clientId: string) => void;
  onBackToDashboard: () => void;
}

type SectionKey = 'emitter' | 'identity' | 'client' | 'meta' | 'items';

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
  initialQuote,
  savedClients,
  onSaveQuote,
  onConvertQuoteToInvoice,
  onOpenConvertedInvoice,
  onSaveClientDirect,
  onDeleteSavedClient,
  onBackToDashboard,
}) => {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [selectedSavedClientId, setSelectedSavedClientId] = useState<string>('');
  const [clientSavedFeedback, setClientSavedFeedback] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    emitter: true,
    identity: true,
    client: true,
    meta: true,
    items: true,
  });
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfReadySuccess, setPdfReadySuccess] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const pdfSheetRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateEmitter = (changes: Partial<EmitterProfile>) => {
    setQuote((prev) => ({
      ...prev,
      emitter: { ...prev.emitter, ...changes },
      updatedAt: new Date().toISOString(),
    }));
    setPdfReadySuccess(false);
  };

  const handleEmitterCountryChange = (countryName: string) => {
    const cfg = getCountryConfig(countryName);
    updateEmitter({
      country: countryName,
      taxIdLabel: cfg.defaultTaxIdLabel,
    });
  };

  const updateClient = (changes: Partial<ClientData>) => {
    setQuote((prev) => ({
      ...prev,
      client: { ...prev.client, ...changes },
      updatedAt: new Date().toISOString(),
    }));
    setPdfReadySuccess(false);
  };

  const handleClientCountryChange = (countryName: string) => {
    const cfg = getCountryConfig(countryName);
    updateClient({
      country: countryName,
      taxIdLabel: cfg.defaultTaxIdLabel,
    });
  };

  const handleResetNewClient = () => {
    setSelectedSavedClientId('');
    updateClient({
      id: `cli-${Date.now()}`,
      name: '',
      companyName: '',
      taxIdLabel: 'NIT',
      taxId: '',
      email: '',
      address: '',
      city: '',
      country: 'Colombia',
    });
  };

  const handleSaveCurrentClientToList = () => {
    if (!quote.client.name.trim()) return;
    const clientToSave: ClientData = {
      ...quote.client,
      id: quote.client.id || `cli-${Date.now()}`,
    };
    updateClient(clientToSave);
    if (onSaveClientDirect) {
      onSaveClientDirect(clientToSave);
    }
    setSelectedSavedClientId(clientToSave.id);
    setClientSavedFeedback(true);
    setTimeout(() => setClientSavedFeedback(false), 2500);
  };

  const handleSelectPalette = (paletteId: PaletteId, primaryHex: string) => {
    setQuote((prev) => ({
      ...prev,
      paletteId,
      primaryColor: primaryHex,
      emitter: {
        ...prev.emitter,
        selectedPaletteId: paletteId,
        primaryColor: primaryHex,
      },
      updatedAt: new Date().toISOString(),
    }));
    setPdfReadySuccess(false);
  };

  const handleCustomColorChange = (hex: string) => {
    setQuote((prev) => ({
      ...prev,
      primaryColor: hex,
      emitter: {
        ...prev.emitter,
        primaryColor: hex,
      },
      updatedAt: new Date().toISOString(),
    }));
    setPdfReadySuccess(false);
  };

  const handleUpdateItem = (id: string, changes: Partial<InvoiceItem>) => {
    setQuote((prev) => {
      const nextItems = prev.items.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      );
      return {
        ...prev,
        items: nextItems,
        totals: calculateInvoiceTotals(nextItems, prev.taxConfig),
        updatedAt: new Date().toISOString(),
      };
    });
    setPdfReadySuccess(false);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `q-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      concept: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: quote.taxConfig.enabled ? quote.taxConfig.defaultRate : 0,
    };

    setQuote((prev) => {
      const nextItems = [...prev.items, newItem];
      return {
        ...prev,
        items: nextItems,
        totals: calculateInvoiceTotals(nextItems, prev.taxConfig),
        updatedAt: new Date().toISOString(),
      };
    });
    setPdfReadySuccess(false);
  };

  const handleRemoveItem = (id: string) => {
    setQuote((prev) => {
      if (prev.items.length <= 1) return prev;
      const nextItems = prev.items.filter((i) => i.id !== id);
      return {
        ...prev,
        items: nextItems,
        totals: calculateInvoiceTotals(nextItems, prev.taxConfig),
        updatedAt: new Date().toISOString(),
      };
    });
    setPdfReadySuccess(false);
  };

  const handleUpdateTaxConfig = (changes: Partial<TaxConfig>) => {
    setQuote((prev) => {
      const nextTaxConfig = { ...prev.taxConfig, ...changes };
      return {
        ...prev,
        taxConfig: nextTaxConfig,
        totals: calculateInvoiceTotals(prev.items, nextTaxConfig),
        updatedAt: new Date().toISOString(),
      };
    });
    setPdfReadySuccess(false);
  };

  const handleSaveDraft = () => {
    onSaveQuote(quote, false);
    setSaveToast('Cotización guardada correctamente.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleGenerateAndDownloadPdf = async () => {
    const issues = validateQuote(quote);
    setValidationIssues(issues);

    if (issues.length > 0) {
      const sectionsToOpen: Partial<Record<SectionKey, boolean>> = {};
      issues.forEach((issue) => {
        if (issue.section === 'emitter') sectionsToOpen.emitter = true;
        if (issue.section === 'client') sectionsToOpen.client = true;
        if (issue.section === 'invoice') sectionsToOpen.meta = true;
        if (issue.section === 'items') sectionsToOpen.items = true;
      });
      setOpenSections((prev) => ({ ...prev, ...sectionsToOpen }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!pdfSheetRef.current) return;

    try {
      setIsGeneratingPdf(true);
      const updatedQuote: Quote = {
        ...quote,
        status: quote.status === 'draft' ? 'sent' : quote.status,
        updatedAt: new Date().toISOString(),
      };
      setQuote(updatedQuote);
      onSaveQuote(updatedQuote, true);

      await generateAndDownloadInvoicePdf(pdfSheetRef.current, updatedQuote);
      setPdfReadySuccess(true);
    } catch (error) {
      console.error('Error al generar el PDF de cotización:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const emitterCountryCfg = getCountryConfig(quote.emitter.country);
  const clientCountryCfg = getCountryConfig(quote.client.country);

  const STATUS_LABELS: Record<Quote['status'], string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Vencida',
    converted: 'Convertida en factura',
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 lg:pb-12">
      {/* Barra superior fija */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver a cotizaciones</span>
            </button>
            <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-neutral-900">
                  {quote.number || 'Nueva Cotización'}
                </h1>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    quote.status === 'accepted'
                      ? 'bg-emerald-600 text-white'
                      : quote.status === 'converted'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {STATUS_LABELS[quote.status]}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                Crea tu propuesta comercial en formato A4 y conviértela en factura en un clic cuando sea aprobada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveToast}
              </span>
            )}

            {quote.status === 'accepted' && !quote.convertedInvoiceId && onConvertQuoteToInvoice && (
              <button
                type="button"
                onClick={() => onConvertQuoteToInvoice(quote)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Convertir en factura</span>
              </button>
            )}

            {quote.status === 'converted' && quote.convertedInvoiceId && onOpenConvertedInvoice && (
              <button
                type="button"
                onClick={() => onOpenConvertedInvoice(quote.convertedInvoiceId!)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Ver factura {quote.convertedInvoiceNumber}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateAndDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-neutral-800 disabled:opacity-60 rounded-lg shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isGeneratingPdf
                  ? 'Generando PDF...'
                  : pdfReadySuccess
                  ? 'Descargar cotización PDF'
                  : 'Generar PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal de 2 columnas en Desktop */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {validationIssues.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-white border-l-4 border-l-red-600 border border-neutral-200 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Revisa los siguientes datos antes de descargar tu cotización:
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-neutral-700 list-disc list-inside">
                    {validationIssues.map((issue, i) => (
                      <li key={i}>{issue.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValidationIssues([])}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {pdfReadySuccess && validationIssues.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  ¡Tu cotización {quote.number} ha sido generada y descargada en PDF!
                </p>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Cuando tu cliente la apruebe, cambia su estado a "Aceptada" y conviértela en factura con un solo clic.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateAndDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF nuevamente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: FORMULARIO PASO A PASO */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            {/* PASO 1 — DATOS DEL EMISOR */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('emitter')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-500" />
                      Paso 1 — Datos del emisor
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Tu información profesional o de empresa y logotipo
                    </p>
                  </div>
                </div>
                {openSections.emitter ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {openSections.emitter && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100 space-y-4">
                  <LogoUploader
                    logoDataUrl={quote.emitter.logoDataUrl}
                    onChange={(dataUrl) => updateEmitter({ logoDataUrl: dataUrl })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Nombre completo o razón social <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.name}
                        onChange={(e) => updateEmitter({ name: e.target.value })}
                        placeholder="Ej. Alejandro Gómez / Estudio Nimbus S.A.S."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Actividad profesional o especialidad{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.activity}
                        onChange={(e) => updateEmitter({ activity: e.target.value })}
                        placeholder="Ej. Desarrollador Web Full-Stack, Consultor UX/UI"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        País del emisor
                      </label>
                      <select
                        value={quote.emitter.country}
                        onChange={(e) => handleEmitterCountryChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Ciudad <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.city}
                        onChange={(e) => updateEmitter({ city: e.target.value })}
                        placeholder={emitterCountryCfg.cityPlaceholder}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Etiqueta de identificación tributaria
                      </label>
                      <input
                        type="text"
                        list="quote-tax-id-labels"
                        value={quote.emitter.taxIdLabel}
                        onChange={(e) => updateEmitter({ taxIdLabel: e.target.value })}
                        placeholder="NIT, RUT, RFC, RUC, ID Fiscal..."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                      <datalist id="quote-tax-id-labels">
                        {TAX_ID_LABEL_SUGGESTIONS.map((label) => (
                          <option key={label} value={label} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Número ({quote.emitter.taxIdLabel || 'Identificación tributaria'}){' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.taxId}
                        onChange={(e) => updateEmitter({ taxId: e.target.value })}
                        placeholder={emitterCountryCfg.taxIdPlaceholder}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Correo electrónico <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="email"
                        value={quote.emitter.email}
                        onChange={(e) => updateEmitter({ email: e.target.value })}
                        placeholder="hola@tudominio.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Teléfono <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.phone}
                        onChange={(e) => updateEmitter({ phone: e.target.value })}
                        placeholder={emitterCountryCfg.phonePlaceholder}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Dirección comercial <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.emitter.address}
                        onChange={(e) => updateEmitter({ address: e.target.value })}
                        placeholder={emitterCountryCfg.addressPlaceholder}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 2 — IDENTIDAD VISUAL */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('identity')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-neutral-500" />
                      Personaliza tu cotización
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Selecciona una de las 3 paletas profesionales o ajusta tu color de marca
                    </p>
                  </div>
                </div>
                {openSections.identity ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {openSections.identity && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100">
                  <VisualIdentitySection
                    selectedPaletteId={quote.paletteId}
                    primaryColor={quote.primaryColor}
                    onSelectPalette={handleSelectPalette}
                    onChangeCustomColor={handleCustomColorChange}
                  />
                </div>
              )}
            </div>

            {/* PASO 3 — DATOS DEL CLIENTE */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('client')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-neutral-500" />
                      Datos del cliente
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Destinatario de la propuesta comercial
                    </p>
                  </div>
                </div>
                {openSections.client ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {openSections.client && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100 space-y-4">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                        Cliente de la cotización:
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {savedClients.length > 0 && (
                          <select
                            value={selectedSavedClientId}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__new__') {
                                handleResetNewClient();
                                return;
                              }
                              setSelectedSavedClientId(val);
                              const found = savedClients.find((c) => c.id === val);
                              if (found) updateClient({ ...found });
                            }}
                            className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                          >
                            <option value="__new__">
                              + Crear nuevo cliente (limpiar campos)
                            </option>
                            {savedClients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.taxId ? `(${c.taxIdLabel}: ${c.taxId})` : ''}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={handleResetNewClient}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Nuevo cliente</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveCurrentClientToList}
                          disabled={!quote.client.name.trim()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded-lg transition-colors"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>
                            {clientSavedFeedback ? '¡Cliente guardado!' : 'Guardar en lista'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {selectedSavedClientId &&
                      onDeleteSavedClient &&
                      savedClients.some((c) => c.id === selectedSavedClientId) && (
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/70 text-[11px] text-neutral-500">
                          <span>
                            Cliente seleccionado del directorio frecuente.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteSavedClient(selectedSavedClientId);
                              setSelectedSavedClientId('');
                            }}
                            className="text-red-600 hover:underline font-medium shrink-0 ml-2"
                          >
                            Eliminar de frecuentes
                          </button>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Nombre del cliente o empresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={quote.client.name}
                        onChange={(e) => updateClient({ name: e.target.value })}
                        placeholder="Ej. Corporación Andina S.A. / Laura Méndez"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        País del cliente
                      </label>
                      <select
                        value={quote.client.country}
                        onChange={(e) => handleClientCountryChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Ciudad <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.client.city}
                        onChange={(e) => updateClient({ city: e.target.value })}
                        placeholder={clientCountryCfg.cityPlaceholder}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Etiqueta de identificación fiscal
                      </label>
                      <input
                        type="text"
                        list="quote-tax-id-labels"
                        value={quote.client.taxIdLabel}
                        onChange={(e) => updateClient({ taxIdLabel: e.target.value })}
                        placeholder="NIT, RUT, RFC, RUC, ID Fiscal..."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        {quote.client.taxIdLabel || 'Identificación tributaria'}{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.client.taxId}
                        onChange={(e) => updateClient({ taxId: e.target.value })}
                        placeholder={clientCountryCfg.taxIdPlaceholder}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Correo electrónico <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="email"
                        value={quote.client.email}
                        onChange={(e) => updateClient({ email: e.target.value })}
                        placeholder="administracion@cliente.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Dirección fiscal <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.client.address}
                        onChange={(e) => updateClient({ address: e.target.value })}
                        placeholder={clientCountryCfg.addressPlaceholder}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 4 — INFORMACIÓN DE COTIZACIÓN Y ALCANCE */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('meta')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-neutral-500" />
                      Detalles de la cotización y alcance
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Numeración COT-2026-0001, validez, tiempo de ejecución, alcance y condiciones
                    </p>
                  </div>
                </div>
                {openSections.meta ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {openSections.meta && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Número de cotización <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={quote.number}
                        onChange={(e) =>
                          setQuote((prev) => ({ ...prev, number: e.target.value }))
                        }
                        placeholder="COT-2026-0001"
                        className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Título del documento en PDF
                      </label>
                      <select
                        value={quote.documentTitle}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            documentTitle: e.target.value as QuoteTitleType,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      >
                        <option value="COTIZACIÓN">COTIZACIÓN</option>
                        <option value="PRESUPUESTO">PRESUPUESTO</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Fecha de emisión <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={quote.issueDate}
                        onChange={(e) =>
                          setQuote((prev) => ({ ...prev, issueDate: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Fecha de vencimiento / validez{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={quote.validUntilDate}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            validUntilDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Moneda <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={quote.currency}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            currency: e.target.value as CurrencyCode,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      >
                        {CURRENCY_LIST.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.code} — {curr.name} ({curr.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Tiempo estimado de ejecución{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.estimatedDeliveryTime}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            estimatedDeliveryTime: e.target.value,
                          }))
                        }
                        placeholder="Ej. 3 a 4 semanas hábiles / 15 días"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Alcance del proyecto{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <textarea
                        rows={7}
                        value={quote.projectScope}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            projectScope: e.target.value,
                          }))
                        }
                        placeholder="Describe los objetivos, fases del proyecto, entregables principales y qué incluye la propuesta..."
                        className="w-full px-3.5 py-2.5 text-xs leading-relaxed bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 resize-y min-h-[140px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Condiciones de pago{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={quote.paymentConditions}
                        onChange={(e) =>
                          setQuote((prev) => ({
                            ...prev,
                            paymentConditions: e.target.value,
                          }))
                        }
                        placeholder="Ej. 50% de anticipo al aprobar el presupuesto y 50% contra entrega final."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Notas adicionales{' '}
                        <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={quote.notes}
                        onChange={(e) =>
                          setQuote((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Ej. Esta cotización tiene validez de 15 días calendario."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 5 — SERVICIOS O PRODUCTOS COTIZADOS */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('items')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    5
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-neutral-500" />
                      Conceptos y desglose económico
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Servicios incluidos en la cotización, descuentos e impuestos
                    </p>
                  </div>
                </div>
                {openSections.items ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {openSections.items && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100 space-y-5">
                  <LineItemsSection
                    items={quote.items}
                    currency={quote.currency}
                    taxConfig={quote.taxConfig}
                    onUpdateItem={handleUpdateItem}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    onUpdateTaxConfig={handleUpdateTaxConfig}
                  />

                  <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-2">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Subtotal:</span>
                      <span className="font-mono">
                        {formatCurrencyAmount(quote.totals.subtotal, quote.currency, true)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Descuentos:</span>
                      <span className="font-mono">
                        {quote.totals.discountTotal > 0
                          ? `- ${formatCurrencyAmount(
                              quote.totals.discountTotal,
                              quote.currency,
                              false
                            )}`
                          : formatCurrencyAmount(0, quote.currency, false)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>
                        Impuestos (
                        {quote.taxConfig.enabled
                          ? quote.taxConfig.label || 'Impuesto'
                          : 'Desactivado'}
                        ):
                      </span>
                      <span className="font-mono">
                        {quote.taxConfig.enabled
                          ? formatCurrencyAmount(quote.totals.taxTotal, quote.currency, false)
                          : 'Según corresponda (0)'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-700 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Total cotizado:
                      </span>
                      <span className="text-base font-mono font-bold text-white">
                        {formatCurrencyAmount(quote.totals.grandTotal, quote.currency, true)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-neutral-200/60 border border-neutral-300/80 flex items-start gap-3 text-xs text-neutral-600">
              <ShieldAlert className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-neutral-900">Propuesta Comercial:</strong> Esta cotización o presupuesto es un documento comercial informativo y no constituye una factura ni un comprobante fiscal. Una vez aceptada por tu cliente, podrás convertirla directamente en factura.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: VISTA PREVIA EN TIEMPO REAL */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 sticky top-22">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Vista previa de {quote.documentTitle.toLowerCase()} (Formato A4)
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Idéntico al PDF final
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-300/90 bg-neutral-200/70 p-4 xl:p-6 overflow-auto max-h-[calc(100vh-130px)] shadow-inner">
              <div className="origin-top transition-all">
                <QuoteDocument ref={pdfSheetRef} quote={quote} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior flotante en Mobile / Tablet */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-900 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Vista previa
        </button>
        <button
          type="button"
          onClick={handleGenerateAndDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#111111] text-white text-xs font-bold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGeneratingPdf ? 'Generando...' : 'Generar PDF'}
        </button>
      </div>

      {/* Modal de Vista Previa a Pantalla Completa para Mobile/Tablet */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex flex-col">
          <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Vista previa de cotización
              </h3>
              <p className="text-[11px] text-neutral-500">{quote.number}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateAndDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 sm:p-6">
            <QuoteDocument quote={quote} />
          </div>
        </div>
      )}
    </div>
  );
};
