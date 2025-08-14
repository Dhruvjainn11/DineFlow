import QRCode from 'qrcode';

/**
 * QR Code Generator with plan-based customization
 */
export class QRCodeGenerator {
  constructor(cafeInfo, theme, features) {
    this.cafeInfo = cafeInfo;
    this.theme = theme;
    this.features = features;
  }

  /**
   * Generate QR code URL based on cafe plan and table
   */
  generateQRUrl(tableNumber, tableId) {
    const baseUrl = window.location.origin;
    
    // Pro plan with custom domain/subdomain
    if (this.features.customDomain && this.cafeInfo.subdomain) {
      return `https://${this.cafeInfo.subdomain}.dineflow.com/order/table/${tableNumber}`;
    }
    
    // Basic plan with path-based URL
    return `${baseUrl}/order/${this.cafeInfo.id}/table/${tableNumber}`;
  }

  /**
   * Get QR code options based on subscription plan
   */
  getQROptions(tableNumber) {
    const isPro = this.features.premiumQRCodes;
    
    const baseOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
    };

    if (isPro) {
      // Pro plan QR codes with custom branding
      return {
        ...baseOptions,
        color: {
          dark: this.theme.primaryColor || '#000000',
          light: '#FFFFFF'
        },
        // Enhanced options for Pro
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H', // Higher error correction for logo overlay
      };
    }

    // Basic plan QR codes
    return {
      ...baseOptions,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCode(tableNumber, tableId) {
    try {
      const url = this.generateQRUrl(tableNumber, tableId);
      const options = this.getQROptions(tableNumber);
      
      const qrDataUrl = await QRCode.toDataURL(url, options);
      
      // For Pro plans, add logo overlay if available
      if (this.features.premiumQRCodes && this.theme.logoUrl) {
        return await this.addLogoOverlay(qrDataUrl, this.theme.logoUrl);
      }
      
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Add logo overlay to QR code (Pro feature)
   */
  async addLogoOverlay(qrDataUrl, logoUrl) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const qrImage = new Image();
      
      qrImage.onload = () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0);
        
        // Load and draw logo
        const logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';
        
        logoImage.onload = () => {
          const logoSize = Math.min(qrImage.width, qrImage.height) * 0.2; // 20% of QR size
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          
          // Draw white background circle for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        logoImage.onerror = () => {
          // If logo fails to load, return QR without logo
          resolve(qrDataUrl);
        };
        
        logoImage.src = logoUrl;
      };
      
      qrImage.onerror = () => reject(new Error('Failed to process QR code'));
      qrImage.src = qrDataUrl;
    });
  }

  /**
   * Generate QR code as SVG (for high-quality printing)
   */
  async generateQRCodeSVG(tableNumber, tableId) {
    try {
      const url = this.generateQRUrl(tableNumber, tableId);
      const options = {
        ...this.getQROptions(tableNumber),
        type: 'svg',
        width: 300
      };
      
      return await QRCode.toString(url, options);
    } catch (error) {
      console.error('Error generating QR SVG:', error);
      throw new Error('Failed to generate QR SVG');
    }
  }

  /**
   * Generate printable QR code with table information
   */
  async generatePrintableQR(tableNumber, tableId, tableInfo = {}) {
    const qrDataUrl = await this.generateQRCode(tableNumber, tableId);
    
    return {
      qrCode: qrDataUrl,
      tableNumber,
      tableId,
      cafeName: this.cafeInfo.name,
      url: this.generateQRUrl(tableNumber, tableId),
      instructions: this.getPrintInstructions(),
      branding: {
        primaryColor: this.theme.primaryColor,
        logoUrl: this.features.customBranding ? this.theme.logoUrl : null,
        cafeName: this.cafeInfo.name
      },
      ...tableInfo
    };
  }

  /**
   * Get print instructions based on plan
   */
  getPrintInstructions() {
    if (this.features.premiumQRCodes) {
      return {
        title: `Scan to Order at ${this.cafeInfo.name}`,
        subtitle: 'Scan with your phone camera to view menu and place order',
        footer: `Powered by ${this.cafeInfo.name}`
      };
    }

    return {
      title: 'Scan to Order',
      subtitle: 'Scan with your phone camera to view menu and place order',
      footer: 'Powered by DineFlow'
    };
  }

  /**
   * Bulk generate QR codes for multiple tables
   */
  async generateBulkQRCodes(tables) {
    const qrCodes = [];
    
    for (const table of tables) {
      try {
        const qrData = await this.generatePrintableQR(
          table.number, 
          table._id, 
          {
            location: table.location,
            capacity: table.capacity
          }
        );
        qrCodes.push(qrData);
      } catch (error) {
        console.error(`Error generating QR for table ${table.number}:`, error);
        qrCodes.push({
          tableNumber: table.number,
          tableId: table._id,
          error: error.message
        });
      }
    }
    
    return qrCodes;
  }
}

/**
 * Factory function to create QR code generator
 */
export const createQRGenerator = (cafeInfo, theme, features) => {
  return new QRCodeGenerator(cafeInfo, theme, features);
};

/**
 * Utility function to download QR code
 */
export const downloadQRCode = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Utility function to print QR codes
 */
export const printQRCodes = (qrCodes, cafeInfo, theme, features) => {
  const printWindow = window.open('', '_blank');
  const isPro = features.premiumQRCodes;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Codes - ${cafeInfo.name}</title>
      <style>
        body {
          font-family: ${theme.fontFamily || 'Arial'}, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .page {
          width: 210mm;
          margin: 0 auto;
        }
        .qr-card {
          width: 180mm;
          height: 80mm;
          border: 2px solid ${isPro ? theme.primaryColor : '#ccc'};
          border-radius: 8px;
          margin: 10mm auto;
          padding: 10mm;
          display: flex;
          align-items: center;
          page-break-inside: avoid;
          background: ${isPro ? theme.secondaryColor + '10' : '#f9f9f9'};
        }
        .qr-code {
          width: 60mm;
          height: 60mm;
          flex-shrink: 0;
        }
        .qr-info {
          flex: 1;
          padding-left: 15mm;
          text-align: center;
        }
        .table-number {
          font-size: 28px;
          font-weight: bold;
          color: ${isPro ? theme.primaryColor : '#333'};
          margin-bottom: 5mm;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 3mm;
          color: #333;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 5mm;
        }
        .footer {
          font-size: 12px;
          color: #999;
        }
        .logo {
          width: 30px;
          height: 30px;
          object-fit: contain;
          margin-bottom: 5mm;
        }
        @media print {
          body { margin: 0; }
          .page { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        ${qrCodes.map(qr => `
          <div class="qr-card">
            <div class="qr-code">
              <img src="${qr.qrCode}" alt="QR Code" style="width: 100%; height: 100%;">
            </div>
            <div class="qr-info">
              ${qr.branding.logoUrl ? `<img src="${qr.branding.logoUrl}" class="logo" alt="Logo">` : ''}
              <div class="table-number">Table ${qr.tableNumber}</div>
              <div class="title">${qr.instructions.title}</div>
              <div class="subtitle">${qr.instructions.subtitle}</div>
              ${qr.location ? `<div style="font-size: 12px; color: #666;">Location: ${qr.location}</div>` : ''}
              <div class="footer">${qr.instructions.footer}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export default QRCodeGenerator;
