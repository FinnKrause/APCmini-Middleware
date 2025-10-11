export async function exportSectionAsPDF(selector) {
  const section = document.querySelector(selector);
  if (!section) return;

  // Capture the section as an image
  const canvas = await html2canvas(section, {
    scale: 2, // higher resolution
    useCORS: true,
    backgroundColor: '#ffffff', // or null for transparency
  });

  // Convert to Base64 PNG
  const imgData = canvas.toDataURL('image/png');

  // Ask the main process to save it as a PDF
  await window.electronAPI.saveImageAsPDF(imgData);
}