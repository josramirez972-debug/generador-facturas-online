import { Invoice, Quote } from '../types/invoice';

export async function generateAndDownloadInvoicePdf(
  element: HTMLElement,
  invoice: Invoice | Quote
): Promise<void> {
  const safeNumber = (invoice.number || 'Documento')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/__+/g, '_');
  const filename = `${safeNumber}.pdf`;

  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const opt = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2.5,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#FFFFFF',
      scrollY: 0,
      windowWidth: 794,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['tr', '.avoid-page-break'],
    },
  };

  await html2pdf().set(opt).from(element).save();
}
