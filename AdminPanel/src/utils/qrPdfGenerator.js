import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Generate single QR code PDF
export const generateQRPDF = (table, cafe) => {
  const pdf = new jsPDF('portrait', 'mm', [80, 100]); // 80x100mm (roughly 3x4 inches)
  
  // Set background color (cafe theme)
  const bgColor = cafe.theme?.primaryColor || '#3B82F6';
  pdf.setFillColor(bgColor);
  pdf.rect(0, 0, 80, 100, 'F');
  
  // Add "Order Here" text
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  const orderText = 'Order Here';
  const orderTextWidth = pdf.getTextWidth(orderText);
  pdf.text(orderText, (80 - orderTextWidth) / 2, 15);
  
  // Add QR code image
  if (table.qrCode) {
    const qrSize = 50; // 50mm QR code
    const qrX = (80 - qrSize) / 2;
    const qrY = 25;
    
    try {
      pdf.addImage(table.qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
      // Fallback: add text instead of QR
      pdf.setFontSize(10);
      pdf.text('QR Code Error', qrX + 20, qrY + 25);
    }
  }
  
  // Add table number at bottom
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  const tableText = `Table ${table.tableNumber}`;
  const tableTextWidth = pdf.getTextWidth(tableText);
  pdf.text(tableText, (80 - tableTextWidth) / 2, 90);
  
  return pdf;
};

// Download single QR PDF
export const downloadSingleQR = (table, cafe) => {
  const pdf = generateQRPDF(table, cafe);
  const filename = `Table-${table.tableNumber}-${cafe.name.replace(/[^a-zA-Z0-9]/g, '')}-QR.pdf`;
  pdf.save(filename);
};

// Download all QR codes as ZIP
export const downloadAllQRs = async (tables, cafe) => {
  const zip = new JSZip();
  
  for (const table of tables) {
    const pdf = generateQRPDF(table, cafe);
    const pdfBlob = pdf.output('blob');
    const filename = `Table-${table.tableNumber}-${cafe.name.replace(/[^a-zA-Z0-9]/g, '')}-QR.pdf`;
    zip.file(filename, pdfBlob);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `${cafe.name.replace(/[^a-zA-Z0-9]/g, '')}-All-Tables-QR.zip`;
  saveAs(zipBlob, zipFilename);
};