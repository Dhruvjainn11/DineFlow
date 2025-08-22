// TableManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TableForm from './TableForm';
import { getTables } from '../services/tableService';

const TableManagement = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // For super admin: Set selected cafe in localStorage
  useEffect(() => {
    if (user.role === 'super-admin') {
      const urlParams = new URLSearchParams(window.location.search);
      const cafeId = urlParams.get('cafeId') || user.cafeId;
      
      if (cafeId) {
        localStorage.setItem('selectedCafeId', cafeId);
      }
    }
  }, [user]);

  const handleTableCreated = (newTable) => {
    setTables(prev => [...prev, newTable.data]);
    setShowForm(false);
  };

  const loadTables = async () => {
    try {
      setLoading(true);
      const cafeId = user.role === 'super-admin' 
        ? localStorage.getItem('selectedCafeId') 
        : user.cafeId;
      
      const result = await getTables(cafeId);
      setTables(result.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-2">Manage and organize your restaurant tables</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mt-4 sm:mt-0 shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Table
        </button>
      </div>

      {/* Show current cafe info for super admin */}
      {user.role === 'super-admin' && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-sm text-indigo-700 font-medium">
            Managing tables for Cafe ID: <span className="font-bold">{localStorage.getItem('selectedCafeId') || 'None selected'}</span>
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-auto shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Create New Table</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TableForm
              onSuccess={handleTableCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Tables list */}
      {!loading && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Tables ({tables.length})</h2>
            <button 
              onClick={loadTables}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {tables.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tables yet</h3>
              <p className="mt-2 text-gray-500">Get started by creating your first table.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tables.map((table) => (
                <div key={table._id} className="bg-white border border-gray-200 rounded-xl p-5 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Table {table.tableNumber}</h3>
                      {table.tableName && <p className="text-gray-600 mt-1">{table.tableName}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                      {table.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Capacity: {table.capacity}
                  </div>
                  
                  {table.location && (
                    <div className="flex items-center text-gray-600 text-sm mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location: {table.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableManagement;