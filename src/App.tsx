import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  LayoutDashboard,
  Settings,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import {
  ClientData,
  EmitterProfile,
  Invoice,
  InvoiceStatus,
  Quote,
  QuoteStatus,
} from './types/invoice';
import {
  convertQuoteToInvoiceEntity,
  createBlankInvoice,
  createBlankQuote,
  deleteClientFromDirectory,
  loadEmitterProfile,
  loadInvoices,
  loadQuotes,
  loadSavedClients,
  saveClientToDirectory,
  saveEmitterProfile,
  saveInvoices,
  saveQuotes,
} from './services/storageService';
import {
  generateNextInvoiceNumber,
  generateNextQuoteNumber,
} from './utils/formatters';
import { DashboardView } from './components/dashboard/DashboardView';
import { QuotesView } from './components/quotes/QuotesView';
import { ProfileSettingsModal } from './components/dashboard/ProfileSettingsModal';
import { InvoiceEditor } from './components/editor/InvoiceEditor';
import { QuoteEditor } from './components/editor/QuoteEditor';

type ActiveView =
  | 'dashboard'
  | 'invoices'
  | 'quotes'
  | 'invoice-editor'
  | 'quote-editor';

export function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [quotes, setQuotes] = useState<Quote[]>(() => loadQuotes());
  const [emitter, setEmitter] = useState<EmitterProfile>(() => loadEmitterProfile());
  const [savedClients, setSavedClients] = useState<ClientData[]>(() =>
    loadSavedClients()
  );
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversionNotice, setConversionNotice] = useState<string | null>(null);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveQuotes(quotes);
  }, [quotes]);

  useEffect(() => {
    saveEmitterProfile(emitter);
  }, [emitter]);

  // --- GESTIÓN DE FACTURAS ---
  const handleCreateNewInvoice = () => {
    const blank = createBlankInvoice(emitter, invoices);
    setCurrentInvoice(blank);
    setActiveView('invoice-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice({ ...invoice });
    setActiveView('invoice-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const nextNum = generateNextInvoiceNumber(invoices.map((i) => i.number));
    const today = new Date().toISOString().slice(0, 10);
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      number: nextNum,
      issueDate: today,
      status: 'draft',
      sourceQuoteId: undefined,
      sourceQuoteNumber: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [duplicated, ...prev]);
    setCurrentInvoice(duplicated);
    setActiveView('invoice-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleChangeStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status, updatedAt: new Date().toISOString() }
          : inv
      )
    );
  };

  const handleSaveInvoice = (updatedInvoice: Invoice, markGenerated = false) => {
    const finalStatus: InvoiceStatus = markGenerated
      ? updatedInvoice.status === 'draft'
        ? 'generated'
        : updatedInvoice.status
      : updatedInvoice.status;

    const toSave: Invoice = {
      ...updatedInvoice,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };

    setEmitter({ ...toSave.emitter });

    if (toSave.client.name.trim()) {
      const nextClients = saveClientToDirectory(toSave.client);
      setSavedClients(nextClients);
    }

    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === toSave.id);
      if (exists) {
        return prev.map((i) => (i.id === toSave.id ? toSave : i));
      }
      return [toSave, ...prev];
    });

    setCurrentInvoice(toSave);
  };

  // --- GESTIÓN DE COTIZACIONES ---
  const handleCreateNewQuote = () => {
    const blank = createBlankQuote(emitter, quotes);
    setCurrentQuote(blank);
    setActiveView('quote-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditQuote = (quote: Quote) => {
    setCurrentQuote({ ...quote });
    setActiveView('quote-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const nextNum = generateNextQuoteNumber(quotes.map((q) => q.number));
    const today = new Date().toISOString().slice(0, 10);
    const duplicated: Quote = {
      ...quote,
      id: `quo-${Date.now()}`,
      number: nextNum,
      issueDate: today,
      status: 'draft',
      convertedInvoiceId: undefined,
      convertedInvoiceNumber: undefined,
      convertedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotes((prev) => [duplicated, ...prev]);
    setCurrentQuote(duplicated);
    setActiveView('quote-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const handleChangeQuoteStatus = (id: string, status: QuoteStatus) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status, updatedAt: new Date().toISOString() }
          : q
      )
    );
  };

  const handleSaveQuote = (updatedQuote: Quote, markSent = false) => {
    const finalStatus: QuoteStatus = markSent
      ? updatedQuote.status === 'draft'
        ? 'sent'
        : updatedQuote.status
      : updatedQuote.status;

    const toSave: Quote = {
      ...updatedQuote,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };

    setEmitter({ ...toSave.emitter });

    if (toSave.client.name.trim()) {
      const nextClients = saveClientToDirectory(toSave.client);
      setSavedClients(nextClients);
    }

    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === toSave.id);
      if (exists) {
        return prev.map((q) => (q.id === toSave.id ? toSave : q));
      }
      return [toSave, ...prev];
    });

    setCurrentQuote(toSave);
  };

  // --- CONVERSIÓN DE COTIZACIÓN A FACTURA (CON CONTROL ANTI-DUPLICADOS) ---
  const handleConvertQuoteToInvoice = (quoteToConvert: Quote) => {
    if (quoteToConvert.status === 'converted' || quoteToConvert.convertedInvoiceId) {
      const existingInv = invoices.find(
        (i) => i.id === quoteToConvert.convertedInvoiceId
      );
      if (existingInv) {
        setCurrentInvoice(existingInv);
        setActiveView('invoice-editor');
      }
      return;
    }

    const { newInvoice, updatedQuote } = convertQuoteToInvoiceEntity(
      quoteToConvert,
      invoices
    );

    setInvoices((prev) => [newInvoice, ...prev]);
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === updatedQuote.id);
      if (exists) {
        return prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
      }
      return [updatedQuote, ...prev];
    });

    if (newInvoice.client.name.trim()) {
      const nextClients = saveClientToDirectory(newInvoice.client);
      setSavedClients(nextClients);
    }

    setCurrentQuote(updatedQuote);
    setCurrentInvoice(newInvoice);
    setConversionNotice(
      `Cotización ${quoteToConvert.number} convertida exitosamente en la factura ${newInvoice.number}.`
    );
    setTimeout(() => setConversionNotice(null), 5000);
    setActiveView('invoice-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConvertedInvoice = (invoiceId: string) => {
    const found = invoices.find((i) => i.id === invoiceId);
    if (found) {
      setCurrentInvoice(found);
      setActiveView('invoice-editor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveProfileSettings = (updatedEmitter: EmitterProfile) => {
    setEmitter(updatedEmitter);
  };

  const handleSaveClientDirect = (client: ClientData) => {
    if (!client.name.trim()) return;
    const nextClients = saveClientToDirectory(client);
    setSavedClients(nextClients);
  };

  const handleDeleteSavedClient = (clientId: string) => {
    const nextClients = deleteClientFromDirectory(clientId);
    setSavedClients(nextClients);
  };

  const showTopNav =
    activeView === 'dashboard' ||
    activeView === 'invoices' ||
    activeView === 'quotes';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-[#111111]">
      {/* Navegación principal con Dashboard, Facturas, Cotizaciones y Configuración */}
      {showTopNav && (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center shadow-xs shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-neutral-950">
                  Generador de Facturas Online
                </span>
                <span className="hidden md:inline-block ml-2 text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Facturas & Cotizaciones · PDF A4
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  activeView === 'dashboard'
                    ? 'font-semibold text-neutral-950 bg-neutral-100'
                    : 'font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('invoices')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  activeView === 'invoices'
                    ? 'font-semibold text-neutral-950 bg-neutral-100'
                    : 'font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Facturas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('quotes')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  activeView === 'quotes'
                    ? 'font-semibold text-neutral-950 bg-neutral-100'
                    : 'font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Cotizaciones</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Configuración</span>
              </button>

              <div className="h-4 w-[1px] bg-neutral-200 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={handleCreateNewQuote}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear nueva cotización</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNewInvoice}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Crear nueva factura</span>
                <span className="sm:hidden">Factura</span>
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Notificación superior tras convertir una cotización en factura */}
      {conversionNotice && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{conversionNotice}</span>
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1">
        {activeView === 'dashboard' && (
          <DashboardView
            invoices={invoices}
            quotes={quotes}
            emitter={emitter}
            onCreateNew={handleCreateNewInvoice}
            onCreateNewQuote={handleCreateNewQuote}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onChangeStatus={handleChangeStatus}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onChangeQuoteStatus={handleChangeQuoteStatus}
            onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
            onNavigateToQuotes={() => setActiveView('quotes')}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {activeView === 'invoices' && (
          <DashboardView
            invoices={invoices}
            quotes={quotes}
            emitter={emitter}
            onCreateNew={handleCreateNewInvoice}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onChangeStatus={handleChangeStatus}
            onOpenSettings={() => setSettingsOpen(true)}
            invoicesOnlyMode={true}
          />
        )}

        {activeView === 'quotes' && (
          <QuotesView
            quotes={quotes}
            onCreateNewQuote={handleCreateNewQuote}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onChangeQuoteStatus={handleChangeQuoteStatus}
            onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
            onOpenConvertedInvoice={handleOpenConvertedInvoice}
          />
        )}

        {activeView === 'invoice-editor' && currentInvoice && (
          <InvoiceEditor
            key={currentInvoice.id}
            initialInvoice={currentInvoice}
            savedClients={savedClients}
            onSaveInvoice={handleSaveInvoice}
            onSaveClientDirect={handleSaveClientDirect}
            onDeleteSavedClient={handleDeleteSavedClient}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'quote-editor' && currentQuote && (
          <QuoteEditor
            key={currentQuote.id}
            initialQuote={currentQuote}
            savedClients={savedClients}
            onSaveQuote={handleSaveQuote}
            onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
            onOpenConvertedInvoice={handleOpenConvertedInvoice}
            onSaveClientDirect={handleSaveClientDirect}
            onDeleteSavedClient={handleDeleteSavedClient}
            onBackToDashboard={() => setActiveView('quotes')}
          />
        )}
      </main>

      {/* Modal de configuración de perfil e identidad visual */}
      {settingsOpen && (
        <ProfileSettingsModal
          emitter={emitter}
          onSave={handleSaveProfileSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
