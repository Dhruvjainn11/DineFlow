import express from 'express';
import Cafe from '../models/Cafe.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { execSync } from 'child_process';

const router = express.Router();

// Get available printers
router.get('/available', protect, allowRoles('admin'), async (req, res) => {
  try {
    const output = execSync('wmic printer get name', { encoding: 'utf8' });
    const printers = output.split('\n')
      .filter(line => line.trim() && !line.includes('Name'))
      .map(line => line.trim());
    
    res.json({ success: true, printers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get printers' });
  }
});

// Test printer connection
router.post('/test', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { printerName } = req.body;
    
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `printer:${printerName}`,
    });

    const isConnected = await printer.isPrinterConnected();
    
    if (isConnected) {
      printer.alignCenter();
      printer.println('TEST PRINT');
      printer.println(req.user.cafeId.name);
      printer.drawLine();
      printer.alignLeft();
      printer.println('Printer: ' + printerName);
      printer.println('Time: ' + new Date().toLocaleString());
      printer.cut();
      
      await printer.execute();
      
      res.json({ success: true, message: 'Test print successful' });
    } else {
      res.json({ success: false, message: 'Printer not connected' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get printer settings
router.get('/settings', protect, allowRoles('admin'), async (req, res) => {
  try {
    const cafeId = req.user.cafeId?._id || req.user.cafeId;
    const cafe = await Cafe.findById(cafeId);
    
    if (!cafe) {
      return res.status(404).json({ success: false, message: 'Cafe not found' });
    }
    
    res.json({ 
      success: true, 
      settings: cafe.settings?.printerSettings || {
        enabled: false,
        printerName: '',
        printerType: 'thermal',
        autoPrint: false,
        copies: 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update printer settings
router.put('/settings', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { enabled, printerName, printerType, autoPrint, copies } = req.body;
    const cafeId = req.user.cafeId?._id || req.user.cafeId;
    
    const result = await Cafe.findByIdAndUpdate(cafeId, {
      'settings.printerSettings': {
        enabled: Boolean(enabled),
        printerName: printerName || '',
        printerType: printerType || 'thermal',
        autoPrint: Boolean(autoPrint),
        copies: parseInt(copies) || 1
      }
    }, { new: true });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Cafe not found' });
    }
    
    res.json({ success: true, message: 'Printer settings updated' });
  } catch (error) {
    console.error('Printer settings update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;