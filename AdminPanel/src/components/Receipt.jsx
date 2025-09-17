import React from "react";

export default function Receipt({ order, onClose, cafe, cafeData}) {
  if (!order) return null;
  
  // Debug: Check for multiple renders
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  console.log(`Receipt render #${renderCount.current} for order:`, order._id);
  
  const handlePrint = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖨️ Print Bill clicked');
    
    // Create unique flag for this component instance
    const flagKey = `receiptPrint_${order._id}`;
    
    if (window[flagKey]) {
      console.log('⚠️ Receipt print already in progress for this order');
      return;
    }
    
    window[flagKey] = true;
    
    // Direct print without delay
    console.log('🖨️ Executing window.print()');
    window.print();
    
    // Reset flag after a reasonable time
    setTimeout(() => {
      window[flagKey] = false;
      console.log('✅ Receipt print flag reset');
    }, 2000);
  }, [order._id]);
  
  // Use actual GST data from order or fallback to calculation
  const subtotal = order.subtotal || 0;
  const totalAmount = order.totalAmount || order.totalPrice || 0;
  const serviceCharge = order.serviceCharge || 0;
  const roundOffAmount = order.roundOffAmount || 0;
  const finalAmount = order.finalAmount || totalAmount;
  
  // Get CGST and SGST amounts from order GST details
  const cgstData = order.gstDetails?.ratesApplied?.find(rate => rate.rateName === 'CGST');
  const sgstData = order.gstDetails?.ratesApplied?.find(rate => rate.rateName === 'SGST');
  
  const cgstAmount = cgstData?.amount || 0;
  const sgstAmount = sgstData?.amount || 0;
  const cgstRate = cgstData?.percentage || 0;
  const sgstRate = sgstData?.percentage || 0;
  
  console.log("GST breakdown:", { cgstAmount, sgstAmount, cgstRate, sgstRate });
  
  

  return (
    <>
      <div className="receipt-overlay" onClick={onClose} />
      <div className="receipt-container" id="receipt-to-print">
        <div className="receipt-content">
          <h2 className="receipt-header">Cafe {cafe}</h2>
          <div className="cafe-address">
            <p>123 Main Street</p>
            <p>City, State - 123456</p>
          </div>
          <div className="receipt-meta">
            <p>Order ID: {order._id}</p>
            <p>Table No: {order.tableNumber || "N/A"}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th className="item-col">Item</th>
                <th className="qty-col">Qty</th>
                <th className="price-col">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const { menuItem, quantity, itemPrice, size } = item;
                const actualPrice = itemPrice || menuItem?.price || 0;
                return (
                  <tr key={menuItem?._id || index}>
                    <td className="item-col">
                      <div style={{wordWrap: 'break-word', fontSize: '6px', lineHeight: '1.1'}}>
                        {menuItem?.name || 'Unknown Item'}
                        {size?.label && <span style={{color: '#666'}}> ({size.label})</span>}
                      </div>
                    </td>
                    <td className="qty-col">{quantity}</td>
                    <td className="price-col">
                      ₹{(actualPrice * quantity).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="subtotal-label">
                  Subtotal
                </td>
                <td className="price-col">₹{subtotal.toFixed(2)}</td>
              </tr>
              {cgstAmount > 0 && (
                <tr>
                  <td colSpan={2} className="gst-label">
                    CGST ({cgstRate}%)
                  </td>
                  <td className="price-col">₹{cgstAmount.toFixed(2)}</td>
                </tr>
              )}
              {sgstAmount > 0 && (
                <tr>
                  <td colSpan={2} className="gst-label">
                    SGST ({sgstRate}%)
                  </td>
                  <td className="price-col">₹{sgstAmount.toFixed(2)}</td>
                </tr>
              )}
              {serviceCharge > 0 && (
                <tr>
                  <td colSpan={2} className="gst-label">
                    Service Charge
                  </td>
                  <td className="price-col">₹{serviceCharge.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2} className="subtotal-label">
                  Total
                </td>
                <td className="price-col">₹{totalAmount.toFixed(2)}</td>
              </tr>
              {roundOffAmount !== 0 && (
                <tr>
                  <td colSpan={2} className="gst-label">
                    Round Off
                  </td>
                  <td className="price-col">{roundOffAmount > 0 ? '+' : ''}₹{roundOffAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2} className="total-label">
                  Final Amount
                </td>
                <td className="total-price">₹{finalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="receipt-footer">
            <p>Thank you for dining with us!</p>
            <p>Visit again soon</p>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="print-button" 
            onClick={handlePrint}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('⚠️ Double click prevented');
            }}
          >
            Print Bill
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        /* Base styles for screen display */
        .receipt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .receipt-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 5px;
          width: 180px;
          max-width: 52mm;
          font-family: "Courier New", Courier, monospace;
          font-size: 6px;
          line-height: 1.1;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          z-index: 1001;
        }

        .receipt-content {
          width: 100%;
          padding: 0;
          margin: 0;
        }

        .receipt-header {
          text-align: center;
          margin: 0 0 3px 0;
          font-weight: bold;
          font-size: 8px;
          padding-bottom: 2px;
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .cafe-address {
          text-align: center;
          margin: 0 0 4px 0;
          font-size: 6px;
          line-height: 1.1;
          padding-bottom: 3px;
          border-bottom: 1px dashed #000;
        }
        
        .cafe-address p {
          margin: 1px 0;
        }

        .receipt-meta {
          margin-bottom: 4px;
          font-size: 6px;
        }

        .receipt-meta p {
          margin: 1px 0;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin: 4px 0;
          font-size: 6px;
        }

        .receipt-table th {
          padding: 2px 1px;
          border-bottom: 1px solid #000;
          font-weight: bold;
        }
        
        .receipt-table th.item-col {
          text-align: left;
        }
        
        .receipt-table th.qty-col {
          text-align: center;
        }
        
        .receipt-table th.price-col {
          text-align: right;
        }

        .receipt-table td {
          padding: 1px 1px;
          vertical-align: top;
        }

        .item-col {
          text-align: left;
          width: 65%;
          padding-right: 1px;
          word-wrap: break-word;
        }

        .qty-col {
          text-align: center;
          width: 10%;
          padding: 0 1px;
        }

        .price-col {
          text-align: right;
          width: 25%;
          padding-left: 1px;
        }

        .subtotal-label,
        .gst-label {
          text-align: right;
          font-weight: bold;
          padding-right: 8px;
        }

        .total-label {
          text-align: right;
          font-weight: bold;
          font-size: 7px;
          padding-right: 4px;
        }

        .total-price {
          text-align: right;
          font-weight: bold;
          font-size: 7px;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 6px;
          font-size: 6px;
          padding-top: 3px;
          border-top: 1px dashed #000;
          width: 100%;
        }

        .receipt-footer p {
          margin: 1px 0;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          margin-top: 16px;
          gap: 8px;
        }

        .print-button,
        .close-button {
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .print-button {
          background-color: #0070f3;
          color: white;
        }

        .close-button {
          background-color: #ddd;
          color: #333;
        }

        /* Print-specific styles */
        @media print {
          body * {
            visibility: hidden;
            margin: 0;
            padding: 0;
          }

          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }

          .receipt-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 52mm;
            max-width: 52mm;
            padding: 1.5mm;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
            transform: none;
            font-size: 5px;
          }

          .action-buttons {
            display: none;
          }

          .receipt-overlay {
            display: none;
          }

          /* Ensure no page breaks within the receipt */
          .receipt-content {
            page-break-inside: avoid;
          }

          /* Thermal printers often need darker text */
          * {
            color: black !important;
            background-color: white !important;
          }
        }

        @page {
          size: 52mm auto;
          margin: 0.5mm;
        }
      `}</style>
    </>
  );
}