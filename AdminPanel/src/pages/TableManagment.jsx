import React, { useEffect, useState } from "react";
import { getTables , deleteTable} from "../services/tableService";
import AdminLayout from "../layouts/AdminLayout";
import TableForm from "../components/TableForm";
import { socket } from "../utils/socket"; // Adjust the import path as necessary
import { Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog"; // Adjust the import path as necessary

export default function TableManagement({ onClose }) {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showtableData, setShowTableData] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);


  const tableStatuses = {
    EMPTY: "bg-gray-200",
    ORDERED: "bg-yellow-400",
    DONE: "border-4 border-green-500 animate-pulse bg-red-500",
    PAID: "bg-green-500",
  };

  useEffect(() => {
    fetchTables();

    // Real-time updates
    socket.on("tableCreated", (newTable) => {
      setTables((prev) => [...prev, newTable]);
    });
   socket.on("tableDeleted", (deleted) => {
     setTables((prev) => prev.filter((table) => table._id !== deleted._id));
   })

    return () => {
      socket.off("tableCreated");
      socket.off("tableDeleted");
    };
  }, []);

  const fetchTables = async () => {
    const data = await getTables();
    setTables(data);
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="w-full flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer"
          >
            + Add Table
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">Table Management</h2>
     

        <div className="grid grid-cols-2 gap-8 p-6 rounded-lg shadow-lg w-full max-w-5xl">
          {tables.map((table, index) => (
            <div key={index} className="relative flex flex-col items-center ">
              <span className=" relative right-24 text-xl font-semibold text-gray-700">
                Table {table.tableNumber}
              </span>
              <div
                className={`relative w-60 h-60  bg-gray-200 flex items-center justify-center rounded-full shadow-md transition-all duration-500 cursor-pointer ${
                  tableStatuses[table.status]
                }`}
               onClick={() => {
  setSelectedTable(table); // 👈 set clicked table
  setShowTableData(true);
}}

              >
                {/* Seats around the table */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-10 h-10  rounded-full shadow-lg ${
                      (table.Order?.length || 0) > i
                        ? "bg-yellow-600"
                        : "bg-gray-300"
                    }`}
                    style={{
                      top: `${50 - 35 * Math.sin((i * (2 * Math.PI)) / 5)}%`,
                      left: `${50 + 35 * Math.cos((i * (2 * Math.PI)) / 5)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <TableForm
            onClose={() => setShowForm(false)}
            fetchTables={fetchTables}
          />
        )}

        {showtableData && (
          <div
            id="modal-backdrop"
            onClick={handleBackdropClick}
            className="fixed inset-0  flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Semi-transparent backdrop
          >
            <div className="relative bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg">
              {/* Close Icon */}
              <button
                onClick={() => setShowTableData(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Table Data
              </h2>
              <div>
                <div className="space-y-4">
                 
                   {selectedTable && (
  <div className="p-4 border rounded-lg shadow-sm">
    <h4 className="font-semibold text-2xl">
      Table {selectedTable.tableNumber}
    </h4>
    <p className={`font-medium`}>
      Status: {selectedTable.status}
    </p>
    <p className="font-medium">
      Orders: {selectedTable.currentOrder?.length || 0}
    </p>

    <button
      onClick={() => promptDelete(selectedTable._id)}
      className="absolute bottom-8 right-8 text-gray-500 hover:text-red-600 transition cursor-pointer"
    >
      <Trash2 size={24} className="text-red-600" />
    </button>
  </div>
)}


                    
              
                  
                </div>
                 
               
              </div>

               {confirmDialogOpen && (
               <ConfirmDialog
                 message="Are you sure you want to delete this Table?"
                 onConfirm={confirmDelete}
                 onCancel={() => setConfirmDialogOpen(false)}
               />
             )}

            </div>


          </div>
        )}
      </div>
    </AdminLayout>
  );
}
