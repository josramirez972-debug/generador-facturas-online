import React from 'react';
import { Check, Palette, RotateCcw } from 'lucide-react';
import { PALETTES } from '../../config/palettes';
import { PaletteId } from '../../types/invoice';

interface VisualIdentitySectionProps {
  selectedPaletteId: PaletteId;
  primaryColor: string;
  onSelectPalette: (paletteId: PaletteId, primaryHex: string) => void;
  onChangeCustomColor: (hex: string) => void;
}

export const VisualIdentitySection: React.FC<VisualIdentitySectionProps> = ({
  selectedPaletteId,
  primaryColor,
  onSelectPalette,
  onChangeCustomColor,
}) => {
  const currentPalette = PALETTES.find((p) => p.id === selectedPaletteId) || PALETTES[0];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">
          Paletas profesionales sugeridas
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Elige una combinación sobria y corporativa. Se aplicará al encabezado, títulos, línea decorativa y total de tu factura.
        </p>
      </div>

      {/* 3 Tarjetas de Paletas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {PALETTES.map((palette) => {
          const isSelected =
            selectedPaletteId === palette.id &&
            primaryColor.toLowerCase() === palette.primary.toLowerCase();

          return (
            <div
              key={palette.id}
              className={`flex flex-col justify-between rounded-xl p-4 border transition-all ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50/90 ring-1 ring-neutral-900 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-neutral-900">{palette.name}</h4>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                  {palette.description}
                </p>

                {/* Muestras de color */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {palette.swatches.map((swatch) => (
                      <div
                        key={swatch.hex}
                        className="group relative flex-1 h-7 rounded-md border border-neutral-200/80 shadow-inner"
                        style={{ backgroundColor: swatch.hex }}
                        title={`${swatch.label}: ${swatch.hex}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>{palette.swatches[0].hex}</span>
                    <span>{palette.swatches[1].hex}</span>
                    <span>{palette.swatches[2].hex}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPalette(palette.id, palette.primary)}
                className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                }`}
              >
                {isSelected ? 'Paleta activa' : 'Usar esta paleta'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selector manual de color principal */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <label
              htmlFor="custom-primary-color"
              className="block text-xs font-semibold text-neutral-900"
            >
              Personalizar color principal manualmente
            </label>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Ajusta el tono exacto de tu marca si deseas variar el color principal de la paleta elegida.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5">
            <input
              id="custom-primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => onChangeCustomColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Seleccionar color principal"
            />
            <input
              type="text"
              value={primaryColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChangeCustomColor(val);
                }
              }}
              className="w-20 text-xs font-mono font-semibold text-neutral-800 focus:outline-none uppercase"
              maxLength={7}
            />
          </div>

          {primaryColor.toLowerCase() !== currentPalette.primary.toLowerCase() && (
            <button
              type="button"
              onClick={() => onSelectPalette(currentPalette.id, currentPalette.primary)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg transition-colors"
              title="Restaurar color de la paleta"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
