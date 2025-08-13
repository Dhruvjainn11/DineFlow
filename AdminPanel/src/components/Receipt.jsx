import React from "react";

export default function Receipt({ order, onClose }) {
  if (!order) return null;

  const gstPercent = 0.05; // 5% GST
  const subtotal = order.totalPrice;
  const gstAmount = subtotal * gstPercent;
  const totalAmount = subtotal + gstAmount;
  console.log(order);

  return (
    <>
      <div className="receipt-overlay" onClick={onClose} />
      <div className="receipt-container" id="receipt-to-print">
        <div className="receipt-content">
          <h2 className="receipt-header">Cafe XYZ</h2>
          <div className="receipt-meta">
            <p>Order ID: {order._id}</p>
            <p>Table No: {order.tableNumber?.tableNumber || "N/A"}</p>
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
              {order.items.map(({ menuItem, quantity }) => (
                <tr key={menuItem._id}>
                  <td className="item-col">{menuItem.name}</td>
                  <td className="qty-col">{quantity}</td>
                  <td className="price-col">
                    ₹{(menuItem.price * quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="subtotal-label">
                  Subtotal
                </td>
                <td className="price-col">₹{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="gst-label">
                  GST (5%)
                </td>
                <td className="price-col">₹{gstAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="total-label">
                  Total
                </td>
                <td className="total-price">₹{totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="receipt-footer">
            <p>Thank you for dining with us!</p>
            <p>Visit again soon</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="print-button" onClick={() => window.print()}>
            Print Bill
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
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
          padding: 20px;
          width: 300px;
          max-width: 80mm;
          font-family: "Courier New", Courier, monospace;
          font-size: 14px;
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
          margin: 0 0 8px 0;
          font-weight: bold;
          font-size: 18px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #000;
        }

        .receipt-meta {
          margin-bottom: 12px;
          font-size: 12px;
        }

        .receipt-meta p {
          margin: 4px 0;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 13px;
        }

        .receipt-table th {
          padding: 4px 0;
          border-bottom: 1px solid #000;
          font-weight: bold;
        }

        .receipt-table td {
          padding: 4px 0;
          vertical-align: top;
        }

        .item-col {
          text-align: left;
          width: 60%;
        }

        .qty-col {
          text-align: right;
          width: 15%;
          padding-right: 8px;
        }

        .price-col {
          text-align: right;
          width: 25%;
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
          font-size: 14px;
          padding-right: 8px;
        }

        .total-price {
          text-align: right;
          font-weight: bold;
          font-size: 14px;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          padding-top: 8px;
          border-top: 1px dashed #000;
        }

        .receipt-footer p {
          margin: 4px 0;
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
            width: 80mm;
            max-width: 80mm;
            padding: 5mm;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
            transform: none;
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
          size: auto;
          margin: 0;
        }
      `}</style>
    </>
  );
}