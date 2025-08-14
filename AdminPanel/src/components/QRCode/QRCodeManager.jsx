import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import FeatureGate, { FeatureToggle } from '../Common/FeatureGate';
import { createQRGenerator, downloadQRCode, printQRCodes } from '../../utils/qrCodeGenerator';

const QRCodeManager = () => {
  const { theme, features, cafeInfo, hasFeature } = useTheme();
  const { token } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize QR generator
  const qrGenerator = createQRGenerator(cafeInfo, theme, features);

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, [token]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Generate QR code for a single table
  const generateSingleQR = async (table) => {
    if (qrCodes[table._id]) return; // Already generated

    setIsGenerating(true);
    try {
      const qrData = await qrGenerator.generatePrintableQR(
        table.number,
        table._id,
        {
          location: table.location,
          capacity: table.capacity,
          status: table.status
        }
      );

      setQrCodes(prev => ({
        ...prev,
        [table._id]: qrData
      }));
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate QR codes for all tables
  const generateAllQRCodes = async () => {
    setIsGenerating(true);
    try {
      const qrDataArray = await qrGenerator.generateBulkQRCodes(tables);
      const qrCodesMap = {};
      
      qrDataArray.forEach(qrData => {
        if (!qrData.error) {
          qrCodesMap[qrData.tableId] = qrData;
        }
      });

      setQrCodes(qrCodesMap);
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download single QR code
  const downloadSingle = (table) => {
    const qrData = qrCodes[table._id];
    if (qrData) {
      downloadQRCode(qrData.qrCode, `table-${table.number}-qr.png`);
    }
  };

  // Download selected QR codes as ZIP (Pro feature)
  const downloadBulk = () => {
    if (!hasFeature('premiumQRCodes')) return;
    
    // In a real implementation, you'd create a ZIP file
    selectedTables.forEach(tableId => {
      const table = tables.find(t => t._id === tableId);
      const qrData = qrCodes[tableId];
      if (table && qrData) {
        downloadQRCode(qrData.qrCode, `table-${table.number}-qr.png`);
      }
    });
  };

  // Print selected QR codes
  const printSelected = () => {
    const selectedQRCodes = selectedTables
      .map(tableId => qrCodes[tableId])
      .filter(Boolean);
    
    if (selectedQRCodes.length > 0) {
      printQRCodes(selectedQRCodes, cafeInfo, theme, features);
    }
  };

  // Filter tables based on search and status
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.number.toString().includes(searchTerm) ||
                         (table.location && table.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && table.status === 'available') ||
                         (filterStatus === 'inactive' && table.status !== 'available');
    return matchesSearch && matchesStatus;
  });

  // Handle table selection
  const toggleTableSelection = (tableId) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(filteredTables.map(table => table._id));
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  // Handle bulk actions
  const handleBulkAction = () => {
    switch(bulkAction) {
      case 'download':
        downloadBulk();
        break;
      case 'print':
        printSelected();
        break;
      case 'regenerate':
        // Regenerate QR codes for selected tables
        selectedTables.forEach(tableId => {
          const table = tables.find(t => t._id === tableId);
          if (table) generateSingleQR(table);
        });
        break;
      default:
        break;
    }
    setBulkAction('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">QR Code Management</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate and manage QR codes for your restaurant tables
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FeatureToggle feature="premiumQRCodes">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Premium QR Codes
              </span>
            </FeatureToggle>
            <button
              onClick={generateAllQRCodes}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate All QR Codes'}
            </button>
          </div>
        </div>

        {/* Pro Plan Features Overview */}
        <FeatureToggle 
          feature="premiumQRCodes" 
          fallback={
            <FeatureGate 
              feature="premiumQRCodes" 
              upgradeMessage="Upgrade to Pro for branded QR codes with your logo, custom colors, and subdomain links"
            />
          }
        >
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-900">Premium QR Features Active</h4>
                <p className="text-xs text-purple-700 mt-1">
                  Custom colors • Logo overlay • Branded domains • High-resolution • Bulk operations
                </p>
              </div>
            </div>
          </div>
        </FeatureToggle>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search and Filters */}
          <div className="flex flex-1 space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="all">All Tables</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTables.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="text-sm border border-blue-300 rounded-md px-2 py-1"
                >
                  <option value="">Choose action...</option>
                  <option value="print">Print Selected</option>
                  <FeatureToggle feature="premiumQRCodes">
                    <option value="download">Download All</option>
                  </FeatureToggle>
                  <option value="regenerate">Regenerate</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select All Option */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectAllTables}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Select All ({filteredTables.length})
            </button>
            {selectedTables.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="text-gray-500">
            Showing {filteredTables.length} of {tables.length} tables
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map(table => (
            <QRCodeCard
              key={table._id}
              table={table}
              qrData={qrCodes[table._id]}
              isSelected={selectedTables.includes(table._id)}
              onSelect={() => toggleTableSelection(table._id)}
              onGenerate={() => generateSingleQR(table)}
              onDownload={() => downloadSingle(table)}
              isGenerating={isGenerating}
              features={features}
              theme={theme}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-4 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTables.length === filteredTables.length && filteredTables.length > 0}
                    onChange={selectedTables.length === filteredTables.length ? clearSelection : selectAllTables}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map(table => (
                <QRCodeTableRow
                  key={table._id}
                  table={table}
                  qrData={qrCodes[table._id]}
                  isSelected={selectedTables.includes(table._id)}
                  onSelect={() => toggleTableSelection(table._id)}
                  onGenerate={() => generateSingleQR(table)}
                  onDownload={() => downloadSingle(table)}
                  isGenerating={isGenerating}
                  features={features}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No tables found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding tables to your restaurant.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// QR Code Card Component (Grid View)
const QRCodeCard = ({ table, qrData, isSelected, onSelect, onGenerate, onDownload, isGenerating, features, theme }) => {
  const isPro = features.premiumQRCodes;

  return (
    <div className={`bg-white rounded-lg shadow border-2 transition-all ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <h4 className="font-semibold text-gray-900">Table {table.number}</h4>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full font-medium ${
            table.status === 'available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {table.status}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3">
          {qrData ? (
            <img 
              src={qrData.qrCode} 
              alt={`QR Code for Table ${table.number}`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No QR Code</p>
            </div>
          )}
        </div>

        {/* Table Info */}
        <div className="text-sm text-gray-500 space-y-1 mb-4">
          {table.location && (
            <div>📍 {table.location}</div>
          )}
          <div>👥 {table.capacity} seats</div>
          {isPro && qrData && (
            <div className="text-xs text-purple-600">
              🌟 Premium QR • Branded
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!qrData ? (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full px-3 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Generate QR Code
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onDownload}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Download
              </button>
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// QR Code Table Row Component (List View)
const QRCodeTableRow = ({ table, qrData, isSelected, onSelect, onGenerate, onDownload, isGenerating, features }) => {
  return (
    <tr className={isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">Table {table.number}</div>
            <div className="text-sm text-gray-500">
              {table.location && `📍 ${table.location}`} • 👥 {table.capacity} seats
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          table.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {table.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {qrData ? (
          <div className="flex items-center">
            <img 
              src={qrData.qrCode} 
              alt="QR Code" 
              className="w-10 h-10 object-contain border border-gray-200 rounded"
            />
            <div className="ml-2">
              <div className="text-sm text-gray-900">Generated</div>
              {features.premiumQRCodes && (
                <div className="text-xs text-purple-600">Premium</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not generated</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          {qrData ? (
            <>
              <button
                onClick={onDownload}
                className="text-primary hover:text-primary/80"
              >
                Download
              </button>
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Regenerate
              </button>
            </>
          ) : (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="text-primary hover:text-primary/80 disabled:opacity-50"
            >
              Generate
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default QRCodeManager;
