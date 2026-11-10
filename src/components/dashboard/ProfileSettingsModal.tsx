import React, { useState } from 'react';
import { X, Check, Building2, Palette } from 'lucide-react';
import { EmitterProfile, PaletteId } from '../../types/invoice';
import {
  COUNTRIES,
  TAX_ID_LABEL_SUGGESTIONS,
  getCountryConfig,
} from '../../config/regional';
import { LogoUploader } from '../editor/LogoUploader';
import { VisualIdentitySection } from '../editor/VisualIdentitySection';

interface ProfileSettingsModalProps {
  emitter: EmitterProfile;
  onSave: (updated: EmitterProfile) => void;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  emitter,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<EmitterProfile>({ ...emitter });

  const countryCfg = getCountryConfig(form.country);

  const handleCountryChange = (countryName: string) => {
    const cfg = getCountryConfig(countryName);
    setForm((prev) => ({
      ...prev,
      country: countryName,
      taxIdLabel: cfg.defaultTaxIdLabel,
    }));
  };

  const handleSelectPalette = (paletteId: PaletteId, primaryHex: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPaletteId: paletteId,
      primaryColor: primaryHex,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Configuración de perfil e identidad visual
            </h2>
            <p className="text-xs text-neutral-500">
              Estos datos y colores se pre-cargarán automáticamente cada vez que crees una nueva factura.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Datos predeterminados del emisor
            </h3>

            <LogoUploader
              logoDataUrl={form.logoDataUrl}
              onChange={(logoDataUrl) => setForm((prev) => ({ ...prev, logoDataUrl }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nombre completo o razón social
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Actividad profesional o especialidad
                </label>
                <input
                  type="text"
                  value={form.activity}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, activity: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  País
                </label>
                <select
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
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
                  Ciudad
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder={countryCfg.cityPlaceholder}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Etiqueta de identificación tributaria
                </label>
                <input
                  type="text"
                  list="settings-tax-labels"
                  value={form.taxIdLabel}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, taxIdLabel: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
                <datalist id="settings-tax-labels">
                  {TAX_ID_LABEL_SUGGESTIONS.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Número ({form.taxIdLabel || 'Identificación tributaria'})
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, taxId: e.target.value }))
                  }
                  placeholder={countryCfg.taxIdPlaceholder}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Identidad visual predeterminada
            </h3>

            <VisualIdentitySection
              selectedPaletteId={form.selectedPaletteId}
              primaryColor={form.primaryColor}
              onSelectPalette={handleSelectPalette}
              onChangeCustomColor={(hex) =>
                setForm((prev) => ({ ...prev, primaryColor: hex }))
              }
            />
          </div>

          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
