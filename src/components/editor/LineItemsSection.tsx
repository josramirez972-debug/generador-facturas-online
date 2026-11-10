import React from 'react';
import { Plus, Trash2, Calculator, Percent } from 'lucide-react';
import { CurrencyCode, InvoiceItem, TaxConfig } from '../../types/invoice';
import { calculateLineAmounts } from '../../utils/calculations';
import { formatCurrencyAmount } from '../../utils/formatters';

interface LineItemsSectionProps {
  items: InvoiceItem[];
  currency: CurrencyCode;
  taxConfig: TaxConfig;
  onUpdateItem: (id: string, changes: Partial<InvoiceItem>) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateTaxConfig: (changes: Partial<TaxConfig>) => void;
}

export const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  items,
  currency,
  taxConfig,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onUpdateTaxConfig,
}) => {
  const handleToggleTax = (enabled: boolean) => {
    onUpdateTaxConfig({ enabled });
    if (enabled) {
      // Apply default tax rate to items that currently have 0%
      items.forEach((item) => {
        if (item.taxPercent === 0) {
          onUpdateItem(item.id, { taxPercent: taxConfig.defaultRate || 19 });
        }
      });
    }
  };

  const handleDefaultTaxRateChange = (newRate: number) => {
    const safeRate = Math.min(100, Math.max(0, newRate));
    onUpdateTaxConfig({ defaultRate: safeRate });
    items.forEach((item) => {
      onUpdateItem(item.id, { taxPercent: safeRate });
    });
  };

  return (
    <div className="space-y-5">
      {/* Barra de configuración de impuestos flexible por país */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Calculator className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-neutral-900">
                Configuración de impuestos
              </h4>
              <p className="text-[11px] text-neutral-500">
                Puedes emitir facturas sin impuestos o personalizar la etiqueta (IVA, IGV, ITBMS, Sales Tax) y porcentaje según tu operación.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none self-start sm:self-center">
            <input
              type="checkbox"
              checked={taxConfig.enabled}
              onChange={(e) => handleToggleTax(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-neutral-900" />
            <span className="text-xs font-semibold text-neutral-800">
              {taxConfig.enabled ? 'Impuestos activados' : 'Sin impuestos (0%)'}
            </span>
          </label>
        </div>

        {taxConfig.enabled && (
          <div className="pt-3 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Nombre del impuesto (ej. IVA, IGV, ITBMS, Tax)
              </label>
              <input
                type="text"
                value={taxConfig.label}
                onChange={(e) => onUpdateTaxConfig({ label: e.target.value })}
                placeholder="Ej. IVA"
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Porcentaje general sugerido (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={taxConfig.defaultRate}
                  onChange={(e) => handleDefaultTaxRateChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 pr-8 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
                <Percent className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de conceptos como tarjetas limpias y adaptables a móvil y desktop */}
      <div className="space-y-3.5">
        {items.map((item, index) => {
          const line = calculateLineAmounts(item, taxConfig.enabled);

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Concepto #{index + 1}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-neutral-900">
                    Importe: {formatCurrencyAmount(line.lineTotal, currency, false)}
                  </span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar concepto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Concepto o servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.concept}
                    onChange={(e) => onUpdateItem(item.id, { concept: e.target.value })}
                    placeholder="Ej. Diseño y desarrollo de sitio web corporativo"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Descripción detallada <span className="text-neutral-400 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                    placeholder="Detalla entregables, alcance o fases incluidas en este servicio..."
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 resize-y"
                  />
                </div>
              </div>

              <div
                className={`grid grid-cols-2 ${
                  taxConfig.enabled ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
                } gap-3 pt-1`}
              >
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(item.id, {
                        quantity: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Precio unitario ({currency}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) =>
                      onUpdateItem(item.id, {
                        unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={item.discountPercent}
                    onChange={(e) =>
                      onUpdateItem(item.id, {
                        discountPercent: Math.min(
                          100,
                          Math.max(0, parseFloat(e.target.value) || 0)
                        ),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {taxConfig.enabled && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      {taxConfig.label || 'Impuesto'} (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={item.taxPercent}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          taxPercent: Math.min(
                            100,
                            Math.max(0, parseFloat(e.target.value) || 0)
                          ),
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-100/80 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" />
        + Agregar concepto
      </button>
    </div>
  );
};
