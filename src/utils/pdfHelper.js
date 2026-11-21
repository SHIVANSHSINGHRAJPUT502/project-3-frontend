// src/utils/pdfHelper.js
export function getCleanFileName(title) {
  const safeBase = (title || 'StudyNexus-Document')
    .replace(/[^a-zA-Z0-9-_ ]/g, '_')
    .trim()
    .replace(/\s+/g, '_');
  return safeBase.toLowerCase().endsWith('.pdf') ? safeBase : `${safeBase}.pdf`;
}

export async function viewPdfInBrowser(rawUrl, onStart, onEnd) {
  if (!rawUrl) return;

  // Open blank tab immediately on user click so popup blockers never block it
  const newTab = window.open('', '_blank');
  if (newTab) {
    newTab.document.write(
      '<html><head><title>Loading PDF...</title></head><body style="background:#0b1120;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">Loading document...</body></html>'
    );
  }

  try {
    if (onStart) onStart();
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error('Network response was not ok');

    const arrayBuffer = await response.arrayBuffer();
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    if (newTab) {
      newTab.location.href = blobUrl;
    } else {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error('PDF preview fallback:', err);
    if (newTab) {
      newTab.location.href = rawUrl;
    } else {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
    }
  } finally {
    if (onEnd) onEnd();
  }
}

export async function downloadPdfWithProperName(rawUrl, title, onStart, onEnd) {
  if (!rawUrl) return;
  const fileName = getCleanFileName(title);

  try {
    if (onStart) onStart();
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error('Network response was not ok');

    const arrayBuffer = await response.arrayBuffer();
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
  } catch (err) {
    console.error('Blob download fallback:', err);
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
  } finally {
    if (onEnd) onEnd();
  }
}