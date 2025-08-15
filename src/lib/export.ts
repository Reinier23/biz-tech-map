// Lazy-loaded export utilities to keep initial bundle small
// Note: Uses html-to-image for rasterization and jsPDF for PDFs

import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { logAudit } from './audit';

export async function exportMapPNG(container: HTMLElement, filename = "tech-map.png") {
  try {
    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    try { await logAudit('export_png', { filename, scope: 'map' }); } catch {}
  } catch (err) {
    console.error('Export PNG failed', err);
    throw err;
  }
}

export async function exportMapPDF(container: HTMLElement, filename = "tech-map.pdf", companyName = "Your Company") {
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule as { jsPDF: typeof import('jspdf').jsPDF };
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const ts = new Date().toLocaleString();
    doc.text(`Tech Map — ${companyName} — ${ts}`, 16, 22);

    doc.save(filename);
    try { await logAudit('export_pdf', { filename, companyName, scope: 'map' }); } catch {}
  } catch (err) {
    console.error('Export PDF failed', err);
    throw err;
  }
}

export async function exportConsolidationPDF(container: HTMLElement, filename = "consolidation-report.pdf", companyName = "Your Company") {
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule as { jsPDF: typeof import('jspdf').jsPDF };
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const ts = new Date().toLocaleString();
    doc.text(`Consolidation Report — ${companyName} — ${ts}`, 16, 22);

    doc.save(filename);
    try { await logAudit('export_pdf', { filename, companyName, scope: 'consolidation' }); } catch {}
  } catch (err) {
    console.error('Export consolidation PDF failed', err);
    throw err;
  }
}
