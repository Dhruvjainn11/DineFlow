import React, { useEffect, useState } from "react";
import { getTables, deleteTable } from "../services/tableService";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import TableForm from "../components/TableForm";
import TableUpdateForm from "../components/TableUpdateForm";
import { socket } from "../utils/socket";
import { Pencil, Trash2, X, Download, QrCode } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import { downloadSingleQR, downloadAllQRs } from "../utils/qrPdfGenerator";

export default function TableManagement({ onClose }) {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTableData, setShowTableData] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [tableToUpdate, setTableToUpdate] = useState(null);
  const [cafe, setCafe] = useState(null);
  const cafeId = localStorage.getItem("cafeId");

  const tableStatuses = {
    Available: "bg-gray-200",
    Occupied: "bg-yellow-400",
    Reserved: "bg-purple-200 border-2 border-purple-500",
    Maintenance: "bg-red-200 border-2 border-red-500",
    DONE: "border-4 border-green-500 animate-pulse bg-red-500",
    PAID: "bg-green-500",
  };

useEffect(() => {
  fetchTables();

  // Join cafe room for real-time updates
  if (cafeId) {
    socket.emit('joinCafeRoom', cafeId);
  }

  // Set up socket listeners
  const handleTableCreated = (newTable) => {
    setTables(prev => [...prev, newTable]);
  };

  const handleTableUpdated = (updatedTable) => {
    setTables(prev => prev.map(table => 
      table._id === updatedTable._id ? updatedTable : table
    ));
  };

  const handleTableDeleted = (deletedId) => {
    setTables(prev => prev.filter(table => table._id !== deletedId));
    if (selectedTable?._id === deletedId) {
      setShowTableData(false);
    }
  };

  socket.on('tableCreated', handleTableCreated);
  socket.on('tableUpdated', handleTableUpdated);
  socket.on('tableDeleted', handleTableDeleted);

  return () => {
    if (cafeId) {
      socket.emit('leaveCafeRoom', cafeId);
    }
    socket.off('tableCreated', handleTableCreated);
    socket.off('tableUpdated', handleTableUpdated);
    socket.off('tableDeleted', handleTableDeleted);
  };
}, [cafeId, selectedTable]);

  const fetchTables = async () => {
    try {
      const data = await getTables();
      setTables(data.data);
      
      // Set cafe data for QR generation
      if (data.data.length > 0 && data.data[0].cafeId) {
        setCafe(data.data[0].cafeId);
      } else {
        // Fallback: create cafe object from localStorage
        setCafe({
          _id: cafeId,
          name: 'Current Cafe',
          theme: { primaryColor: '#3B82F6' }
        });
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  const promptDelete = (id) => {
    setTableToDelete(id);
    setConfirmDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteTable(tableToDelete);
      setConfirmDialogOpen(false);
      setTableToDelete(null);
      setShowTableData(false);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleUpdate = (updatedTable) => {
    setTables(prev => prev.map(t => 
      t._id === updatedTable._id ? updatedTable : t
    ));
    setShowUpdateForm(false);
  };

  return (
    <RoleBasedLayout>
      <div className="p-6">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Table Management</h2>
          <div className="flex gap-3">
            {tables.length > 0 && cafe && (
              <button
                onClick={() => downloadAllQRs(tables, cafe)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Download All QR
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div 
              key={table._id} 
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div
                className={`h-40 flex items-center justify-center cursor-pointer ${
                  tableStatuses[table.status] || tableStatuses.Available
                }`}
                onClick={() => {
                  setSelectedTable(table);
                  setShowTableData(true);
                }}
              >
                <div className="text-center">
                  <span className="text-2xl font-bold">
                    Table {table.tableNumber}
                  </span>
                  <p className="text-sm mt-1">{table.status}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Capacity: {table.capacity}</p>
                    {table.location && (
                      <p className="text-sm text-gray-600">{table.location}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {cafe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSingleQR(table, cafe);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Download QR Code"
                      >
                        <QrCode size={20} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableToUpdate(table);
                        setShowUpdateForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        promptDelete(table._id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Creation Modal */}
        {showForm && (
          <TableForm
            onClose={() => setShowForm(false)}
            fetchTables={fetchTables}
          />
        )}

        {/* Table Detail Modal */}
        {showTableData && selectedTable && (
          <div
            id="modal-backdrop"
            onClick={handleBackdropClick}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <button
                onClick={() => setShowTableData(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
              >
                <X size={24} />
              </button>
              
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Table {selectedTable.tableNumber}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedTable.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{selectedTable.capacity}</p>
                    </div>
                  </div>
                  
                  {selectedTable.location && (
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedTable.location}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Orders</p>
                    <p className="font-medium">
                      {selectedTable.currentOrder?.length || 0}
                    </p>
                  </div>
                  
                  {selectedTable.status === "Reserved" && selectedTable.reservedBy && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Reservation Details</h3>
                      <p>Name: {selectedTable.reservedBy.name}</p>
                      <p>Phone: {selectedTable.reservedBy.phone}</p>
                      <p>
                        Until: {new Date(selectedTable.reservedBy.reservedUntil).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setTableToUpdate(selectedTable);
                      setShowUpdateForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => promptDelete(selectedTable._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialogOpen && (
          <ConfirmDialog
            message="Are you sure you want to delete this table?"
            onConfirm={confirmDelete}
            onCancel={() => setConfirmDialogOpen(false)}
          />
        )}

        {/* Table Update Form */}
        {showUpdateForm && tableToUpdate && (
          <TableUpdateForm
            table={tableToUpdate}
            onClose={() => setShowUpdateForm(false)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </RoleBasedLayout>
  );
}