import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { validateLogoFile } from '../../utils/validators';

interface LogoUploaderProps {
  logoDataUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoDataUrl,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setError('No se pudo leer la imagen. Intenta con otro archivo.');
    };
    reader.readAsDataURL(file);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Logotipo del negocio <span className="text-neutral-400 font-normal">(Opcional)</span>
        </label>
        <span className="text-[11px] text-neutral-400">PNG, JPG o SVG (máx. 2 MB)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {logoDataUrl ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-28 bg-white border border-neutral-200 rounded-lg flex items-center justify-center p-2 overflow-hidden">
              <img
                src={logoDataUrl}
                alt="Vista previa del logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">
                Logotipo cargado correctamente
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Se muestra automáticamente en el encabezado de la factura.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={triggerSelect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reemplazar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerSelect}
          className="group cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/70 hover:bg-neutral-100/60 transition-all rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-neutral-900 group-hover:border-neutral-400 transition-colors">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">
                Subir logotipo de tu marca o estudio
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Haz clic para seleccionar un archivo PNG, JPG o SVG
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-neutral-700 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 group-hover:border-neutral-400 transition-colors">
            Seleccionar imagen
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-start gap-2 text-[11px] text-neutral-500 bg-neutral-100/80 px-3 py-2 rounded-lg">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <span>
          ¿No tienes logo? Puedes continuar sin él y crear una factura igualmente profesional.
        </span>
      </div>
    </div>
  );
};
