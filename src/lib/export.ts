// Lazy-loaded export utilities to keep initial bundle small
// Note: Uses html-to-image for rasterization and jsPDF for PDFs

export async function exportMapPNG(container: HTMLElement, filename = "tech-map.png") {
  try {
    const html2img = await import('html-to-image');
    const dataUrl = await html2img.toPng(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export PNG failed', err);
    throw err;
  }
}

export async function exportMapPDF(container: HTMLElement, filename = "tech-map.pdf", companyName = "Your Company") {
  try {
    const [{ toPng }, jsPDFModule] = await Promise.all([
      import('html-to-image'),
      import('jspdf'),
    ]);
    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const { jsPDF } = jsPDFModule as unknown as { jsPDF: any };

    // Measure element to decide orientation
    const rect = container.getBoundingClientRect();
    const landscape = rect.width >= rect.height;
    const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'px', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Header
    const ts = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`Tech Map — ${companyName} — ${ts}`, 16, 22);

    const topPadding = 32; // leave room for header

    // Scale image to fit page
    const imgW = rect.width;
    const imgH = rect.height;
    const scale = Math.min((pageW - 32) / imgW, (pageH - topPadding - 16) / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;
    const x = (pageW - renderW) / 2;
    const y = topPadding;

    doc.addImage(dataUrl, 'PNG', x, y, renderW, renderH);
    doc.save(filename);
  } catch (err) {
    console.error('Export PDF failed', err);
    throw err;
  }
}

export async function exportConsolidationPDF(container: HTMLElement, filename = "consolidation-report.pdf", companyName = "Your Company") {
  try {
    const [{ toPng }, jsPDFModule] = await Promise.all([
      import('html-to-image'),
      import('jspdf'),
    ]);

    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const { jsPDF } = jsPDFModule as unknown as { jsPDF: any };
    const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const ts = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`Consolidation Report — ${companyName} — ${ts}`, 16, 22);

    const rect = container.getBoundingClientRect();
    const imgW = rect.width;
    const imgH = rect.height;

    const topPadding = 32;
    const scale = Math.min((pageW - 32) / imgW, (pageH - topPadding - 16) / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;
    const x = (pageW - renderW) / 2;
    const y = topPadding;

    doc.addImage(dataUrl, 'PNG', x, y, renderW, renderH);
    doc.save(filename);
  } catch (err) {
    console.error('Export consolidation PDF failed', err);
    throw err;
  }
}
