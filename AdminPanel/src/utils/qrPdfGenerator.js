import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Generate single QR code PDF
export const generateQRPDF = (table, cafe) => {
  const pdf = new jsPDF('portrait', 'mm', [152.4, 101.6]); // 6x4 inches in mm
  
  // Set beige background and here 
  pdf.setFillColor(245, 245, 220); // Beige color
  pdf.rect(0, 0, 152.4, 160, 'F');
  
  // Add table number with black background
  pdf.setFillColor(121,98,84); // Black background
  pdf.rect(0, 0, 152.4, 12, 'F');
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  const tableText = `Table ${table.tableNumber}`;
  const tableTextWidth = pdf.getTextWidth(tableText);
  pdf.text(tableText, (105 - tableTextWidth) / 2, 8);
  
  // Add cafe name at top center
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(30);
  pdf.setFont(undefined, 'bold');
  const cafeText = cafe.name.toUpperCase();
  const cafeTextWidth = pdf.getTextWidth(cafeText);
  pdf.text(cafeText, (105 - cafeTextWidth) / 2, 28);
  
  // Add "Order Here" text center
  pdf.setFontSize(22);
  pdf.setFont(undefined, 'normal');
  const orderText = 'Order Here';
  const orderTextWidth = pdf.getTextWidth(orderText);
  pdf.text(orderText, (105 - orderTextWidth) / 2, 40);
  
  // Add large QR code image center
  if (table.qrCode) {
    const qrSize = 70; // Much larger QR code (2.8 inches)
    const qrX = (105 - qrSize) / 2;
    const qrY = 40;
    
    try {       
      pdf.addImage(table.qrCode, 'PNG', qrX, qrY + 12, qrSize, qrSize);
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
      pdf.setFontSize(10);
      pdf.text('QR Code Error', qrX + 22, qrY + 70);
    }
  }
  
  // Add "By The Annsh" at bottom of page
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'italic');
  const brandingText = '~By The Annsh';
  const brandingTextWidth = pdf.getTextWidth(brandingText);
  pdf.text(brandingText, (105 - brandingTextWidth) / 2, 145);
  
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