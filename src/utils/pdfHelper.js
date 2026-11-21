// src/utils/pdfHelper.js
export function getCleanFileName(title) {
  const safeBase = (title || 'StudyNexus-Document')
    .replace(/[^a-zA-Z0-9-_ ]/g, '_')
    .trim()
    .replace(/\s+/g, '_');
  return safeBase.toLowerCase().endsWith('.pdf') ? safeBase : `${safeBase}.pdf`;
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