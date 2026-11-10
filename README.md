# Generador de Facturas y Cotizaciones Online

Aplicación web tipo SaaS enfocada en **freelancers, desarrolladores, diseñadores, consultores y pequeños negocios** de Latinoamérica, Estados Unidos y Europa que necesitan crear **cotizaciones/presupuestos comerciales** y **facturas profesionales en formato PDF (A4)** en cuestión de segundos.

---

## Características Principales

### 1. Módulo de Facturación Comercial Internacional
- **Identificación tributaria dinámica y opcional**: Soporta etiquetas regionales personalizables según el país del emisor y del cliente (`NIT`, `RFC`, `RUT`, `RUC`, `CUIT`, `NIF / CIF`, `EIN / Tax ID` o `Identificación tributaria`).
- **Soporte multimoneda**: Formateo nativo con `Intl.NumberFormat` para `COP`, `USD`, `EUR`, `MXN`, `PEN`, `CLP` y `ARS` respetando símbolos y decimales de cada divisa.
- **Impuestos 100% configurables**: Permite facturar sin impuestos (`0%`) o activar impuestos configurando libremente el nombre (`IVA`, `IGV`, `ITBMS`, `Sales Tax`) y el porcentaje general o por línea.
- **Numeración secuencial automática**: Genera consecutivos con formato `FAC-YYYY-0001` editables por el usuario.

### 2. Módulo de Cotizaciones / Presupuestos y Conversión en 1 Clic
- **Entidad independiente de Cotización**: Numeración automática `COT-YYYY-0001`, selector de título (`COTIZACIÓN` o `PRESUPUESTO`), fecha de validez, tiempo estimado de ejecución, alcance detallado del proyecto y condiciones de pago.
- **Ciclo de vida por estados**: `Borrador`, `Enviada`, `Aceptada`, `Rechazada`, `Vencida` y `Convertida en factura`.
- **Conversión automática a Factura**: Cuando una cotización pasa a estado **Aceptada**, permite convertirla en factura con un solo clic copiando emisor, cliente, conceptos, descuentos e impuestos, recalculando totales y manteniendo trazabilidad bidireccional (`sourceQuoteId` ↔ `convertedInvoiceId`) con bloqueo contra duplicaciones accidentales.

### 3. Identidad Visual y Exportación PDF A4 en Tiempo Real
- **3 Paletas corporativas sugeridas**: *Minimalista* (`#111111`), *Profesional Azul* (`#1E3A5F`) y *Elegante Verde* (`#23483A`), más selector manual de color hexadecimal.
- **Gestor de logotipo con validación de seguridad**: Carga en Base64 con validación de tipo MIME (`PNG`, `JPG`, `SVG`, `WebP`) y límite de `2 MB`, con previsualización, reemplazo y eliminación instantánea.
- **Vista previa en vivo y exportación PDF**: Diseño de dos columnas en escritorio y modal a pantalla completa en móvil. Generación de PDF en formato **A4** con protección de cortes de fila (`.avoid-page-break`).

---

## Stack Tecnológico

- **Frontend**: [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Estilos y UI**: [Tailwind CSS 3.4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Iconografía)
- **Motor PDF**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (`html2canvas` + `jsPDF`)
- **Persistencia MVP**: `localStorage` estructurado mediante capa de servicios desacoplada

---

## Arquitectura del Proyecto

El código sigue el principio de **Separación de Responsabilidades (Separation of Concerns)** para facilitar su mantenimiento y futura migración a un backend en la nube:

```text
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                        # Punto de entrada de React
    ├── App.tsx                         # Orquestador de vistas y navegación principal
    ├── index.css                       # Estilos globales y reglas de salto de página PDF
    ├── types/
    │   ├── invoice.ts                  # Modelos de datos (Invoice, Quote, EmitterProfile, ClientData)
    │   └── html2pdf.d.ts               # Declaraciones de tipos para html2pdf.js
    ├── config/
    │   ├── regional.ts                 # Configuración internacional de países, IDs fiscales y monedas
    │   └── palettes.ts                 # Definición de las 3 paletas corporativas
    ├── utils/
    │   ├── calculations.ts             # Motor de cálculo puro (subtotales, descuentos, impuestos, totales)
    │   ├── formatters.ts               # Formateo de monedas, fechas y numeración secuencial
    │   └── validators.ts               # Validaciones de formularios, sanitización XSS y validación de logo
    ├── services/
    │   ├── storageService.ts           # Persistencia en localStorage y conversión Cotización -> Factura
    │   └── pdfService.ts               # Configuración y renderizado de documentos A4 a PDF
    └── components/
        ├── dashboard/
        │   ├── DashboardView.tsx       # Panel general con métricas, facturas y cotizaciones recientes
        │   └── ProfileSettingsModal.tsx# Configuración predeterminada del emisor e identidad visual
        ├── quotes/
        │   └── QuotesView.tsx          # Vista dedicada de gestión y conversión de cotizaciones
        ├── editor/
        │   ├── InvoiceEditor.tsx       # Editor paso a paso de facturas con vista previa en vivo
        │   ├── QuoteEditor.tsx         # Editor paso a paso de cotizaciones con alcance del proyecto
        │   ├── LineItemsSection.tsx    # Componente reutilizable de conceptos e impuestos
        │   ├── LogoUploader.tsx        # Componente reutilizable de subida y validación de logotipo
        │   └── VisualIdentitySection.tsx# Selector reutilizable de paletas y color de marca
        └── preview/
            ├── InvoiceDocument.tsx     # Plantilla A4 corporativa de Factura Comercial
            └── QuoteDocument.tsx       # Plantilla A4 corporativa de Cotización / Presupuesto
```

---

## Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd generador-facturas-online
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173/`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## Alcance Legal del Documento

Los documentos PDF generados por esta plataforma corresponden a **facturas comerciales / cuentas de cobro** y **cotizaciones / presupuestos comerciales**. No sustituyen ni equivalen a comprobantes fiscales electrónicos timbrados ante autoridades tributarias (DIAN, SAT, SII, SUNAT, AFIP, etc.).
